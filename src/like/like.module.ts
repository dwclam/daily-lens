import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Likes } from './like.entity';
import { Posts } from '../post/post.entity';
import { LikesController } from './like.controller';
import { LikesService } from './like.service';


@Module({
  imports: [TypeOrmModule.forFeature([Likes, Posts])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}