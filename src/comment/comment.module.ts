import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from './comment.entity';
import { CommentsController } from './comment.controller';
import { Posts } from '../post/post.entity';
import { CommentsService } from './comment.service';


@Module({
  imports: [TypeOrmModule.forFeature([Comment, Posts])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}