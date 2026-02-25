import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly storage = multer.memoryStorage();

  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, userId: string, ticketId?: string) {
    if (!file) {
      throw new UnprocessableEntityException('文件为空');
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const attachment = this.attachmentRepository.create({
      ticketId,
      filename: file.originalname,
      filepath: `/uploads/${filename}`,
      filesize: file.size,
      uploaderId: userId,
    });

    await this.attachmentRepository.save(attachment);

    return {
      code: 0,
      data: {
        id: attachment.id,
        url: attachment.filepath,
        filename: attachment.filename,
        filesize: attachment.filesize,
      },
    };
  }

  getUploadDir() {
    return this.uploadDir;
  }
}
