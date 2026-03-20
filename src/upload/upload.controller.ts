import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const filename = await this.uploadService.saveFile(file);
    const avatarUrl = `/upload/avatar/${filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    return {
      message: 'Avatar updated successfully',
      avatarUrl,
      user: updatedUser,
    };
  }

  @Get('avatar/:filename')
  getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads/avatars', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Avatar not found');
    }
    return res.sendFile(filePath);
  }
}
