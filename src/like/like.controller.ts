import { Controller, Post, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LikesService } from './like.service';


@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postId')
  toggleLike(@Param('postId', ParseIntPipe) postId: number, @Request() req) {
    return this.likesService.toggleLike(postId, req.user);
  }
}