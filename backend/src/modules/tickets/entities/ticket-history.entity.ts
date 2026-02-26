import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('ticket_histories')
export class TicketHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.histories)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'simple-enum', enum: TicketStatus, nullable: true })
  fromStatus: TicketStatus;

  @Column({ type: 'simple-enum', enum: TicketStatus, nullable: true })
  toStatus: TicketStatus;

  @Column()
  operatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
