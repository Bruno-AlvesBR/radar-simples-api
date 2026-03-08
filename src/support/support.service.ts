import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket, SupportTicketDocument } from './schemas/support-ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private supportTicketModel: Model<SupportTicketDocument>,
  ) {}

  async create(userId: string, subject: string, message: string) {
    const ticket = await this.supportTicketModel.create({
      userId,
      subject,
      message,
    });
    return {
      id: ticket._id,
      subject: ticket.subject,
      message: ticket.message,
      createdAt: ticket.createdAt,
    };
  }
}
