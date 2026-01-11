import {
  Controller,
  Req,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    username: string;
    avatar: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: RequestWithUser) {
    //const token = await this.authService.login(req.user.id, req.user.email);
    return this.authService.login(req.user.id, req.user.email, req.user.username, req.user.avatar);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req: RequestWithUser) {
    return this.authService.refreshToken(req.user.id, req.user.email);
  }
}
