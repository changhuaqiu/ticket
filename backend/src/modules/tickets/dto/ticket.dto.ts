import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { TicketCategory, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '描述不能为空' })
  description: string;

  @IsEnum(TicketCategory, { message: '类别无效' })
  category: TicketCategory;

  @IsEnum(TicketPriority, { message: '优先级无效' })
  @IsOptional()
  priority?: TicketPriority;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class UpdateTicketStatusDto {
  @IsString()
  @IsNotEmpty({ message: '状态不能为空' })
  status: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class AssignTicketDto {
  @IsString()
  @IsNotEmpty({ message: '处理人ID不能为空' })
  handlerId: string;
}

export class QueryTicketDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  priority?: string;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  pageSize?: number = 20;
}
