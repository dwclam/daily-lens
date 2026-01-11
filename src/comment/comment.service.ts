import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/user.entity';
import { Posts } from '../post/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User) {
    const post = await this.postsRepository.findOne({
      where: { id: createCommentDto.postId },
      relations: ['user'], // thon tin tac gia
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const newComment = this.commentsRepository.create({
      content: createCommentDto.content,
      post: post,
      user: user,
    });

    await this.commentsRepository.save(newComment);
    post.commentCount = post.commentCount + 1;
    if (post.user.id !== user.id) {
      post.isChecked = false;
    }

    await this.postsRepository.save(post);
    return newComment;
  }

  async findByPost(postId: number) {
    return await this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
      select: {
        user: { id: true, username: true, avatar: true },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    currentUser: User,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new NotFoundException('Comment không tìm thấy');

    if (comment.user.id !== currentUser.id) {
      throw new ForbiddenException('Bạn không được sửa comment của người khác');
    }

    comment.content = updateCommentDto.content;

    return await this.commentsRepository.save(comment);
  }

  async remove(id: number, currentUser: User) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new NotFoundException('Comment không tìm thấy');

    if (comment.user.id !== currentUser.id) {
      throw new ForbiddenException('Bạn không được xóa comment của người khác');
    }

    return await this.commentsRepository.remove(comment);
  }
}
