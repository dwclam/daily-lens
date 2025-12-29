import { Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './post.entity';
import { PostsController } from './post.controller';
import { PostsService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Posts])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
