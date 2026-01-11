import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id')
  async followUser(@Param('id') id: string, @Request() req) {
    return this.followService.follow(req.user.id, +id);
  }

  @Delete(':id')
  async unfollowUser(@Param('id') id: string, @Request() req) {
    return this.followService.unfollow(req.user.id, +id);
  }

  @Get(':id/is-following')
  async checkIsFollowing(@Param('id') id: string, @Request() req) {
    return this.followService.checkIsFollowing(req.user.id, +id);
  }

  @Get('my-following')
  async getMyFollowing(@Request() req) {
    return this.followService.getFollowing(req.user.id);
  }

  @Get('my-followers')
  async getMyFollowers(@Request() req) {
    return this.followService.getFollowers(req.user.id);
  }
}