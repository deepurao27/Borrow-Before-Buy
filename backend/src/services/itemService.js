import { prisma } from '../config/prisma.js';
import { storage } from '../storage/index.js';
import { CONSTANTS } from '../config/constants.js';

export const createItem = async (ownerId, data) => {
  const item = await prisma.item.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      condition: data.condition,
      securityAmount: data.securityAmount,
      handoverPointId: data.handoverPointId,
      status: 'ACTIVE'
    },
    include: {
      category: true,
      handoverPoint: true
    }
  });

  return item;
};

export const uploadItemPhotos = async (ownerId, itemId, files) => {
  const item = await prisma.item.findUnique({
    where: { id: itemId }
  });

  if (!item) {
    const error = new Error('Item not found.');
    error.status = 404;
    throw error;
  }

  if (item.ownerId !== ownerId) {
    const error = new Error('Only the owner can upload photos for this item.');
    error.status = 403;
    throw error;
  }

  const existingCount = await prisma.itemPhoto.count({
    where: { itemId }
  });

  if (existingCount + files.length > CONSTANTS.MAX_PHOTO_COUNT) {
    const error = new Error(`An item can have at most ${CONSTANTS.MAX_PHOTO_COUNT} photos.`);
    error.status = 400;
    throw error;
  }

  const createdPhotos = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const saved = await storage.save(file.buffer, file.originalname, false);

    const isPrimary = existingCount === 0 && i === 0;

    const photo = await prisma.itemPhoto.create({
      data: {
        itemId,
        url: saved.url,
        key: saved.key,
        isPrimary
      }
    });

    createdPhotos.push(photo);
  }

  return createdPhotos;
};

export const getItems = async ({ q, categoryId, condition, handoverPointId, zone, maxSecurity, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = {
    status: 'ACTIVE',
    ...(categoryId ? { categoryId } : {}),
    ...(condition ? { condition } : {}),
    ...(handoverPointId ? { handoverPointId } : {}),
    ...(maxSecurity !== undefined ? { securityAmount: { lte: maxSecurity } } : {}),
    ...(zone ? { handoverPoint: { zone } } : {})
  };

  if (q && q.trim()) {
    where.OR = [
      { title: { contains: q.trim(), mode: 'insensitive' } },
      { description: { contains: q.trim(), mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        handoverPoint: true,
        photos: { orderBy: { isPrimary: 'desc' } },
        owner: {
          select: {
            id: true,
            name: true,
            department: true,
            year: true
          }
        }
      }
    }),
    prisma.item.count({ where })
  ]);

  // Attach trust summary for each item's owner
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const lenderEvents = await prisma.trustEvent.findMany({
        where: { userId: item.ownerId, roleContext: 'LENDER' }
      });
      const delta = lenderEvents.reduce((acc, ev) => acc + ev.delta, 0);
      const lenderScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + delta));

      return {
        ...item,
        owner: {
          ...item.owner,
          lenderScore
        }
      };
    })
  );

  return {
    items: enrichedItems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getItemById = async (itemId) => {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      category: true,
      handoverPoint: true,
      photos: { orderBy: { isPrimary: 'desc' } },
      availability: true,
      owner: {
        select: {
          id: true,
          name: true,
          department: true,
          year: true,
          createdAt: true
        }
      }
    }
  });

  if (!item) {
    const error = new Error('Item not found.');
    error.status = 404;
    throw error;
  }

  // Calculate owner trust scores
  const [lenderEvents, borrowerEvents, completedLends] = await Promise.all([
    prisma.trustEvent.findMany({ where: { userId: item.ownerId, roleContext: 'LENDER' } }),
    prisma.trustEvent.findMany({ where: { userId: item.ownerId, roleContext: 'BORROWER' } }),
    prisma.transaction.count({ where: { lenderId: item.ownerId, status: 'COMPLETED' } })
  ]);

  const lenderDelta = lenderEvents.reduce((acc, ev) => acc + ev.delta, 0);
  const borrowerDelta = borrowerEvents.reduce((acc, ev) => acc + ev.delta, 0);

  const lenderScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + lenderDelta));
  const borrowerScore = Math.max(0, Math.min(100, CONSTANTS.DEFAULT_TRUST_SCORE + borrowerDelta));

  return {
    ...item,
    owner: {
      ...item.owner,
      lenderScore,
      borrowerScore,
      completedLends
    }
  };
};

export const updateItem = async (ownerId, itemId, data) => {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    const error = new Error('Item not found.');
    error.status = 404;
    throw error;
  }
  if (item.ownerId !== ownerId) {
    const error = new Error('Only the owner can update this item.');
    error.status = 403;
    throw error;
  }

  const updated = await prisma.item.update({
    where: { id: itemId },
    data,
    include: {
      category: true,
      handoverPoint: true,
      photos: true
    }
  });

  return updated;
};

export const deleteItem = async (ownerId, itemId) => {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    const error = new Error('Item not found.');
    error.status = 404;
    throw error;
  }
  if (item.ownerId !== ownerId) {
    const error = new Error('Only the owner can delete this item.');
    error.status = 403;
    throw error;
  }

  // Check if item has active transactions
  const activeTx = await prisma.transaction.findFirst({
    where: {
      itemId,
      status: {
        in: ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING', 'BORROWED', 'OVERDUE', 'RETURN_PENDING']
      }
    }
  });

  if (activeTx) {
    const error = new Error('Cannot delete item with active ongoing borrow transactions.');
    error.status = 400;
    throw error;
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { status: 'DISABLED' }
  });

  return { message: 'Item listing has been deactivated.' };
};
