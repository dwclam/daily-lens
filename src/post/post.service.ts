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

  async findAll() {
    return await this.postsRepository.find({
      where: { isPublic : true},
      relations: [
        'user',
        'comments',
        'comments.user',
        'likes',
        'likes.user',
      ],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
        },
        comments: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        likes: {
          id: true,
          user: {
            id: true,
          },
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

  // nguoi dung click vao bai viet
  async markAsChecked(postId: number, userId: number) {

    const post = await this.postsRepository.findOne({ where: { id: postId }, relations: ['user'] });

    if (post && post.user.id === userId) {
      return this.postsRepository.update(postId, { isChecked: true });
    }
  }

  async findUncheckedPosts(userId: number) {
    return this.postsRepository.find({
      where: {
        user: { id: userId }, // Bài của tôi
        isChecked: false      // Chưa check (có tương tác mới)
      },
      order: { updatedAt: 'DESC' }, // Mới nhất lên đầu
      take: 5 // Lấy 5 bài thôi
    });
  }
}