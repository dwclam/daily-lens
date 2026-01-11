import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Likes } from './like.entity';
import { Posts } from '../post/post.entity';
import { User } from '../users/user.entity';


@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Likes)
    private likesRepository: Repository<Likes>,
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
  ) {}

  async toggleLike(postId: number, user: User) {

    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');


    const existingLike = await this.likesRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: user.id },
      },
    });

    if (existingLike) {
      // unlike

      await this.likesRepository.remove(existingLike);
      post.likeCount = post.likeCount - 1;
      await this.postsRepository.save(post);
      return { status: 'unliked', message: 'Đã bỏ thích', likeCount: post.likeCount };
    } else {
      // like
      const newLike = this.likesRepository.create({
        user: user,
        post: post,
      });

      await this.likesRepository.save(newLike);
      post.likeCount = post.likeCount + 1;
      await this.postsRepository.save(post);
      return { status: 'liked', message: 'Đã thích', likeCount: post.likeCount };
    }
  }
}