import { Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads/avatars';

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: any): Promise<string> {
    const uniqueFilename = `${randomUUID()}${extname(file.originalname)}`;
    const filePath = join(this.uploadDir, uniqueFilename);
    
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
      
      writeStream.on('finish', () => resolve(uniqueFilename));
      writeStream.on('error', (error) => reject(error));
    });
  }
}
