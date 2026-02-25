import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { TicketComment } from '../../comments/entities/comment.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';
import { TicketHistory } from './ticket-history.entity';

export enum TicketCategory {
  COMPLAINT = 'complaint',
  INQUIRY = 'inquiry',
  SUGGESTION = 'suggestion',
  OTHER = 'other',
}

export enum TicketPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TicketStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  CONFIRMING = 'confirming',
  CLOSED = 'closed',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  ticketNo: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketCategory,
    default: TicketCategory.OTHER,
  })
  category: TicketCategory;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.NEW,
  })
  status: TicketStatus;

  @Column()
  submitterId: string;

  @ManyToOne(() => User, (user) => user.submittedTickets)
  @JoinColumn({ name: 'submitterId' })
  submitter: User;

  @Column({ nullable: true })
  handlerId: string;

  @ManyToOne(() => User, (user) => user.handledTickets, { nullable: true })
  @JoinColumn({ name: 'handlerId' })
  handler: User;

  @Column({ type: 'timestamp', nullable: true })
  slaDueAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments: TicketComment[];

  @OneToMany(() => Attachment, (attachment) => attachment.ticket)
  attachments: Attachment[];

  @OneToMany(() => TicketHistory, (history) => history.ticket)
  histories: TicketHistory[];
}
