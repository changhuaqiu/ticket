import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';

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

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.SUBMITTER,
  })
  role: UserRole;

  @Column({ nullable: true })
  department: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Ticket, ticket => ticket.submitter)
  submittedTickets: Ticket[];

  @OneToMany(() => Ticket, ticket => ticket.handler)
  handledTickets: Ticket[];
}
