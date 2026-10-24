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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { UploadService } from './upload.service';
import { ApiProperty } from '@nestjs/swagger';

class AvatarUserDto {
  @ApiProperty() id!: number;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ['ADMIN', 'USER'] }) role!: 'ADMIN' | 'USER';
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ nullable: true }) avatarUrl!: string | null;
}

class AvatarUploadResponseDto {
  @ApiProperty({ example: 'Avatar updated successfully' }) message!: string;
  @ApiProperty({ example: '/upload/avatar/abc.png' }) avatarUrl!: string;
  @ApiProperty({ type: AvatarUserDto }) user!: AvatarUserDto;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: AvatarUploadResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatarUrl: true,
      },
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
