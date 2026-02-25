import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';

@ApiTags('评论')
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '添加评论' })
  async create(
    @Param('ticketId') ticketId: string,
    @Body() createDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.create(ticketId, createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  async findAll(@Param('ticketId') ticketId: string) {
    return this.commentsService.findAll(ticketId);
  }
}
