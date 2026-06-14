import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { configuration } from '../config/configuration';

@Injectable()
export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = configuration().upload_dir;
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = ['original', 'result', 'scene'];
    dirs.forEach((dir) => {
      const fullPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    subDir: 'original' | 'result' | 'scene',
  ): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, subDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${subDir}/${filename}`;
  }

  getFilePath(relativePath: string): string {
    return path.join(this.uploadDir, relativePath.replace('/uploads/', ''));
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.getFilePath(relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}