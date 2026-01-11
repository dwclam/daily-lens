import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { User } from '../users/user.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const userToFollow = await this.userRepository.findOne({ where: { id: followingId } });
    if (!userToFollow) throw new NotFoundException('User not found');

    const existingFollow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    });

    if (existingFollow) {
      throw new BadRequestException('Already following');
    }

    const newFollow = this.followRepository.create({
      follower: { id: followerId },
      following: { id: followingId }
    });

    await this.followRepository.save(newFollow);

    await this.userRepository.increment({ id: followerId }, 'followingCount', 1);


    await this.userRepository.increment({ id: followingId }, 'followersCount', 1);

    return newFollow;
  }

  async unfollow(followerId: number, followingId: number) {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    });

    if (!follow) {
      throw new BadRequestException('Not following');
    }

    await this.followRepository.remove(follow);

    await this.userRepository.decrement({ id: followerId }, 'followingCount', 1);

    await this.userRepository.decrement({ id: followingId }, 'followersCount', 1);

    return { success: true };
  }

  async getFollowing(userId: number) {
    return this.followRepository.find({
      where: { follower: { id: userId } },
      relations: ['following'],
      order: { createdAt: 'DESC' }
    });
  }

  async getFollowers(userId: number) {
    return this.followRepository.find({
      where: { following: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async checkIsFollowing(followerId: number, followingId: number) {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    });
    return { isFollowing: !!follow };
  }
}