import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { TicketComment } from '../../comments/entities/comment.entity';

export enum UserRole {
  SUBMITTER = 'submitter',
  HANDLER = 'handler',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SUBMITTER,
  })
  role: UserRole;

  @Column({ length: 100, nullable: true })
  department: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.submitter)
  submittedTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.handler)
  handledTickets: Ticket[];

  @OneToMany(() => TicketComment, (comment) => comment.user)
  comments: TicketComment[];
}
