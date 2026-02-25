import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ticketId: string;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 500 })
  filepath: string;

  @Column()
  filesize: number;

  @Column()
  uploaderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @CreateDateColumn()
  createdAt: Date;
}
