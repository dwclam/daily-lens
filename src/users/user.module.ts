import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { Module } from '@nestjs/common';
import { Posts } from '../post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Posts])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
