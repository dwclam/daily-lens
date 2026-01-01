import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  // 1. Tạo Comment
  async create(createCommentDto: CreateCommentDto, user: User) {
    // Kiểm tra bài viết có tồn tại không
    const post = await this.postsRepository.findOne({ where: { id: createCommentDto.postId } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const newComment = this.commentsRepository.create({
      content: createCommentDto.content,
      post: post,
      user: user,
    });

    return await this.commentsRepository.save(newComment);
  }

  async findByPost(postId: number) {
    return await this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['user'], // Để hiện tên người comment
      select: {
        user: { id: true, username: true, avatar: true }, // Chỉ lấy info cần thiết
      },
      order: { createdAt: 'ASC' }, // Comment cũ nhất lên đầu
    });
  }

  // 3. Sửa Comment (Chỉ chủ sở hữu)
  async update(id: number, updateCommentDto: UpdateCommentDto, currentUser: User) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new NotFoundException('Comment không tìm thấy');

    // Check quyền
    if (comment.user.id !== currentUser.id) {
      throw new ForbiddenException('Bạn không được sửa comment của người khác');
    }

    comment.content = updateCommentDto.content;
    // comment.isEdited = true;

    return await this.commentsRepository.save(comment);
  }

  // 4. Xóa Comment (Chủ comment hoặc Admin có thể xóa - ở đây làm cơ bản là chủ comment)
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