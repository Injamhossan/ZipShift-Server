const SupportTicket = require('../models/supportTicketModel');
const { AppError } = require('../middlewares/errorMiddleware');
const { emitSocketEvent } = require('../services/socketService');

exports.createSupportTicket = async (req, res, next) => {
  try {
    const { subject, details } = req.body;

    if (!subject || !details) {
      throw new AppError('subject and details are required', 400);
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      subject,
      details
    });

    emitSocketEvent(
      'support:ticket-status',
      {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status
      },
      req.auth?.firebase?.uid
    );

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Support ticket created'
    });
  } catch (error) {
    next(error);
  }
};

