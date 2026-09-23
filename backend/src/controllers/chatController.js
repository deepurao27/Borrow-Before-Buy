import { sendMessage, getMessages } from '../services/chatService.js';
import { sendSuccess } from '../utils/response.js';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(2000)
});

export const getTransactionMessages = async (req, res, next) => {
  try {
    const transactionId = req.params.id || req.params.transactionId;
    const messages = await getMessages(transactionId, req.user.id);
    return sendSuccess(res, { messages });
  } catch (err) {
    return next(err);
  }
};

export const postTransactionMessage = async (req, res, next) => {
  try {
    const transactionId = req.params.id || req.params.transactionId;
    const { content } = messageSchema.parse(req.body);
    const message = await sendMessage({
      transactionId,
      senderId: req.user.id,
      content
    });
    return sendSuccess(res, { message }, 'Message sent.', 201);
  } catch (err) {
    return next(err);
  }
};
