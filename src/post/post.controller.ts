import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './post.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { RolesGuard } from '../roles/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}


  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        // Tạo tên file ngẫu nhiên để tránh trùng
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File // 👈 Lấy file từ request
  ) {
    if (!file) {
      throw new BadRequestException('Bạn phải chọn một bức ảnh!');
    }
    const imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    createPostDto.imageUrl = imageUrl;
    return this.postsService.create(createPostDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.postsService.findAll(req.user);
  }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //
  //   return this.postsService.findOne(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/mark-checked')
  markAsChecked(@Param('id') id: string, @Request() req) {
    return this.postsService.markAsChecked(parseInt(id), req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-notifications')
  getMyNotifications(@Request() req) {
    return this.postsService.findUncheckedPosts(req.user.id);
  }
}