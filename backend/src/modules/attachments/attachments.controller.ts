import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Request,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';

@ApiTags('附件')
@Controller('upload')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiOperation({ summary: '上传附件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    return this.attachmentsService.upload(file, req.user.userId);
  }

  @Post('tickets/:ticketId')
  @ApiOperation({ summary: '上传工单附件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToTicket(
    @UploadedFile() file: Express.Multer.File,
    @Param('ticketId') ticketId: string,
    @Request() req: any,
  ) {
    return this.attachmentsService.upload(file, req.user.userId, ticketId);
  }
}
