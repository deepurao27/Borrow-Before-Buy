import path from 'path';
import { prisma } from '../config/prisma.js';
import { storage } from '../storage/index.js';
import { transitionTransaction } from './transactionStateMachine.js';

/**
 * Upload condition checklist and evidence photos
 */
export const uploadConditionEvidence = async (transactionId, actor, { stage = 'BEFORE', notes, checklist = {}, files = [] }) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, lenderId: true, borrowerId: true, status: true }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  const isLender = actor.id === transaction.lenderId;
  const isBorrower = actor.id === transaction.borrowerId;

  // For BEFORE stage, lender uploads the initial condition photos
  if (stage === 'BEFORE' && !isLender && actor.role !== 'ADMIN') {
    const error = new Error('Only the lender can upload pre-handover condition evidence.');
    error.status = 403;
    throw error;
  }

  // For AFTER stage, borrower or lender uploads return condition
  if (stage === 'AFTER' && !isLender && !isBorrower && actor.role !== 'ADMIN') {
    const error = new Error('Only the lender or borrower can upload return condition evidence.');
    error.status = 403;
    throw error;
  }

  // Stage validation against current state
  if (stage === 'BEFORE') {
    if (!['ACCEPTED', 'SECURITY_ACKNOWLEDGED'].includes(transaction.status)) {
      const error = new Error(`Cannot upload pre-handover condition when transaction status is ${transaction.status}.`);
      error.status = 400;
      throw error;
    }
  }

  // Save uploaded files to private storage
  const uploadedKeys = [];
  for (const file of files) {
    const saved = await storage.save(file.buffer, file.originalname, true);
    uploadedKeys.push(saved.filename);
  }

  // Parse checklist if passed as string
  let parsedChecklist = checklist;
  if (typeof checklist === 'string') {
    try {
      parsedChecklist = JSON.parse(checklist);
    } catch (e) {
      parsedChecklist = { note: checklist };
    }
  }

  // Check if a record already exists for this stage
  const existingRecord = await prisma.conditionRecord.findFirst({
    where: { transactionId, stage }
  });

  let record;
  if (existingRecord) {
    const combinedKeys = [...existingRecord.photoKeys, ...uploadedKeys];
    record = await prisma.conditionRecord.update({
      where: { id: existingRecord.id },
      data: {
        notes: notes !== undefined ? notes : existingRecord.notes,
        checklist: parsedChecklist,
        photoKeys: combinedKeys,
        acknowledgedBy: null, // Reset acknowledgement if new evidence is uploaded
        acknowledgedAt: null
      },
      include: {
        creator: { select: { id: true, name: true } },
        acknowledger: { select: { id: true, name: true } }
      }
    });
  } else {
    record = await prisma.conditionRecord.create({
      data: {
        transactionId,
        stage,
        notes: notes || '',
        checklist: parsedChecklist,
        photoKeys: uploadedKeys,
        createdBy: actor.id
      },
      include: {
        creator: { select: { id: true, name: true } },
        acknowledger: { select: { id: true, name: true } }
      }
    });
  }

  return record;
};

/**
 * Acknowledge condition evidence
 */
export const acknowledgeConditionEvidence = async (transactionId, actor) => {
  return await transitionTransaction(transactionId, 'ACKNOWLEDGE_CONDITION', actor);
};

/**
 * Retrieve private evidence file for an authorized user
 */
export const getEvidenceFile = async (transactionId, filename, actor) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, lenderId: true, borrowerId: true }
  });

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.status = 404;
    throw error;
  }

  const isLender = actor.id === transaction.lenderId;
  const isBorrower = actor.id === transaction.borrowerId;
  const isStaff = actor.role === 'ADMIN' || actor.role === 'MODERATOR';

  if (!isLender && !isBorrower && !isStaff) {
    const error = new Error('You are not authorized to view evidence photos for this transaction.');
    error.status = 403;
    throw error;
  }

  // Verify that the requested filename is actually tied to this transaction
  const conditionRecord = await prisma.conditionRecord.findFirst({
    where: {
      transactionId,
      photoKeys: { has: filename }
    }
  });

  if (!conditionRecord && !isStaff) {
    const error = new Error('Evidence file not found for this transaction.');
    error.status = 404;
    throw error;
  }

  const fileBuffer = await storage.get(`private/${filename}`);
  const ext = path.extname(filename).toLowerCase();
  
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';

  return { fileBuffer, mimeType };
};

/**
 * Retrieve private evidence file directly by filename (looking up transaction)
 */
export const getEvidenceByFilename = async (filename, actor) => {
  const conditionRecord = await prisma.conditionRecord.findFirst({
    where: {
      photoKeys: { has: filename }
    },
    include: { transaction: true }
  });

  if (!conditionRecord) {
    const error = new Error('Evidence file not found.');
    error.status = 404;
    throw error;
  }

  const isLender = actor.id === conditionRecord.transaction.lenderId;
  const isBorrower = actor.id === conditionRecord.transaction.borrowerId;
  const isStaff = actor.role === 'ADMIN' || actor.role === 'MODERATOR';

  if (!isLender && !isBorrower && !isStaff) {
    const error = new Error('You are not authorized to view this evidence photo.');
    error.status = 403;
    throw error;
  }

  const fileBuffer = await storage.get(`private/${filename}`);
  const ext = path.extname(filename).toLowerCase();

  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';

  return { fileBuffer, mimeType };
};

