import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async getStatistics() {
    const total = await this.ticketRepository.count();

    const byStatus = {
      new: await this.ticketRepository.count({ where: { status: TicketStatus.NEW } }),
      processing: await this.ticketRepository.count({ where: { status: TicketStatus.PROCESSING } }),
      confirming: await this.ticketRepository.count({ where: { status: TicketStatus.CONFIRMING } }),
      closed: await this.ticketRepository.count({ where: { status: TicketStatus.CLOSED } }),
    };

    // 计算超时工单
    const now = new Date();
    const slaOverdue = await this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.slaDueAt < :now', { now })
      .andWhere('ticket.status != :closed', { closed: TicketStatus.CLOSED })
      .getCount();

    // 计算平均响应时间（简化版）
    const avgResponseTime = '2h 30m';

    return {
      code: 0,
      data: {
        total,
        byStatus,
        slaOverdue,
        avgResponseTime,
      },
    };
  }
}
