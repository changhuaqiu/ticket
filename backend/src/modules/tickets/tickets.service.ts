import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { TicketHistory } from './entities/ticket-history.entity';
import { User } from '../auth/entities/user.entity';
import {
  CreateTicketDto,
  UpdateTicketStatusDto,
  AssignTicketDto,
  QueryTicketDto,
} from './dto/ticket.dto';

// SLA 配置（小时）
const SLA_CONFIG: Record<TicketPriority, number> = {
  [TicketPriority.URGENT]: 2,
  [TicketPriority.HIGH]: 4,
  [TicketPriority.MEDIUM]: 8,
  [TicketPriority.LOW]: 24,
};

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketHistory)
    private historyRepository: Repository<TicketHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 生成工单编号
  private async generateTicketNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.ticketRepository.count({
      where: {
        ticketNo: Like(`TK-${dateStr}-%`),
      },
    });
    return `TK-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  // 计算 SLA 截止时间
  private calculateSlaDueAt(priority: TicketPriority): Date {
    const hours = SLA_CONFIG[priority];
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + hours);
    return dueAt;
  }

  async create(createTicketDto: CreateTicketDto, userId: string) {
    const ticketNo = await this.generateTicketNo();
    const priority = createTicketDto.priority || TicketPriority.MEDIUM;

    const ticket = this.ticketRepository.create({
      title: createTicketDto.title,
      description: createTicketDto.description,
      category: createTicketDto.category,
      priority,
      ticketNo,
      submitterId: userId,
      slaDueAt: this.calculateSlaDueAt(priority),
    });

    await this.ticketRepository.save(ticket);

    // 记录历史
    await this.recordHistory(ticket.id, 'create', null, TicketStatus.NEW, userId, '创建工单');

    return {
      code: 0,
      data: ticket,
      message: '工单创建成功',
    };
  }

  async findAll(query: QueryTicketDto) {
    const { status, priority, keyword, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (keyword) {
      where.title = Like(`%${keyword}%`);
    }

    const [list, total] = await this.ticketRepository.findAndCount({
      where,
      relations: ['submitter', 'handler'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        list: list.map((ticket) => this.formatTicket(ticket)),
        total,
        page,
        pageSize,
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['submitter', 'handler', 'comments', 'comments.user', 'histories', 'histories.operator'],
    });

    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    return {
      code: 0,
      data: this.formatTicketDetail(ticket),
    };
  }

  async updateStatus(id: string, updateDto: UpdateTicketStatusDto, userId: string) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    const newStatus = updateDto.status as TicketStatus;
    if (!this.isValidStatusTransition(ticket.status, newStatus)) {
      throw new BadRequestException('状态转换无效');
    }

    const oldStatus = ticket.status;
    ticket.status = newStatus;

    if (newStatus === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
    }

    await this.ticketRepository.save(ticket);

    // 记录历史
    await this.recordHistory(id, 'status_change', oldStatus, newStatus, userId, updateDto.remark);

    return {
      code: 0,
      data: ticket,
      message: '状态更新成功',
    };
  }

  async assign(id: string, assignDto: AssignTicketDto, userId: string) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    const handler = await this.userRepository.findOne({ where: { id: assignDto.handlerId } });
    if (!handler) {
      throw new NotFoundException('处理人不存在');
    }

    ticket.handlerId = assignDto.handlerId;
    if (ticket.status === TicketStatus.NEW) {
      ticket.status = TicketStatus.PROCESSING;
    }

    await this.ticketRepository.save(ticket);

    // 记录历史
    await this.recordHistory(id, 'assign', null, null, userId, `分配给 ${handler.name}`);

    return {
      code: 0,
      data: ticket,
      message: '分配成功',
    };
  }

  private isValidStatusTransition(from: TicketStatus, to: TicketStatus): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.NEW]: [TicketStatus.PROCESSING, TicketStatus.CLOSED],
      [TicketStatus.PROCESSING]: [TicketStatus.CONFIRMING, TicketStatus.PROCESSING],
      [TicketStatus.CONFIRMING]: [TicketStatus.CLOSED, TicketStatus.PROCESSING],
      [TicketStatus.CLOSED]: [],
    };
    return validTransitions[from].includes(to);
  }

  private async recordHistory(
    ticketId: string,
    action: string,
    fromStatus: TicketStatus | null,
    toStatus: TicketStatus | null,
    operatorId: string,
    remark?: string,
  ) {
    const history = this.historyRepository.create({
      ticket: { id: ticketId } as any,
      action,
      fromStatus,
      toStatus,
      operatorId,
      remark,
    });
    await this.historyRepository.save(history);
  }

  private formatTicket(ticket: Ticket) {
    return {
      id: ticket.id,
      ticketNo: ticket.ticketNo,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      slaDueAt: ticket.slaDueAt,
      submitter: ticket.submitter ? { id: ticket.submitter.id, name: ticket.submitter.name } : null,
      handler: ticket.handler ? { id: ticket.handler.id, name: ticket.handler.name } : null,
      createdAt: ticket.createdAt,
    };
  }

  private formatTicketDetail(ticket: Ticket) {
    return {
      ...this.formatTicket(ticket),
      description: ticket.description,
      category: ticket.category,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      comments: ticket.comments?.map((c) => ({
        id: c.id,
        content: c.content,
        user: { id: c.user?.id, name: c.user?.name },
        createdAt: c.createdAt,
      })),
      histories: ticket.histories?.map((h) => ({
        id: h.id,
        action: h.action,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        operator: { id: h.operator?.id, name: h.operator?.name },
        remark: h.remark,
        createdAt: h.createdAt,
      })),
    };
  }
}
