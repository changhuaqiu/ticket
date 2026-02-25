import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketComment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(TicketComment)
    private commentRepository: Repository<TicketComment>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async create(ticketId: string, createDto: CreateCommentDto, userId: string) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    const comment = this.commentRepository.create({
      ticket: { id: ticketId } as any,
      user: { id: userId } as any,
      content: createDto.content,
    });

    await this.commentRepository.save(comment);

    return {
      code: 0,
      data: comment,
      message: '评论添加成功',
    };
  }

  async findAll(ticketId: string) {
    const comments = await this.commentRepository.find({
      where: { ticket: { id: ticketId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return {
      code: 0,
      data: comments.map((c) => ({
        id: c.id,
        content: c.content,
        user: { id: c.user?.id, name: c.user?.name },
        createdAt: c.createdAt,
      })),
    };
  }
}
