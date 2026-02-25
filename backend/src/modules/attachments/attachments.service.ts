import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) {}

  async upload(file: Express.Multer.File, userId: string, ticketId?: string) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

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
}
