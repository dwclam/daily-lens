import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
  ) {}
  async create(createPostDto: CreatePostDto, user: User) {
    const newPost = this.postsRepository.create({
      ...createPostDto,
      user: user,
    });

    return await this.postsRepository.save(newPost);
  }

  // 2. LẤY TẤT CẢ (NEWSFEED)
  async findAll() {
    return await this.postsRepository.find({
      relations: ['user'], // Quan trọng: Lấy kèm thông tin người đăng (để hiện avatar, tên)
      select: {
        // Chỉ lấy các trường cần thiết của User để bảo mật (tránh lộ password)
        user: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'], // Lấy kèm thông tin tác giả
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }


  async update(id: number, updatePostDto: UpdatePostDto, currentUser: User) {
    const post = await this.findOne(id);
    if (post.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updatedPost = this.postsRepository.merge(post, updatePostDto);
    return await this.postsRepository.save(updatedPost);
  }

  async remove(id: number, currentUser: User) {
    const post = await this.findOne(id);


    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = post.user.id === currentUser.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    return await this.postsRepository.remove(post);
  }
}