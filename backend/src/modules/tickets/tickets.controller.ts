import { Controller, Post, Put, Get, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketStatusDto, AssignTicketDto, QueryTicketDto } from './dto/ticket.dto';

@ApiTags('工单')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: '创建工单' })
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.create(createTicketDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取工单列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(@Query() query: QueryTicketDto) {
    return this.ticketsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工单详情' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新工单状态' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketStatusDto,
    @Request() req: any,
  ) {
    return this.ticketsService.updateStatus(id, updateDto, req.user.userId);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: '分配处理人' })
  async assign(
    @Param('id') id: string,
    @Body() assignDto: AssignTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.assign(id, assignDto, req.user.userId);
  }
}
