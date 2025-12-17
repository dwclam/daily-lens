import { Controller,Request, Post, UseGuards, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local')) 
  @Post('login')
  async login(@Request() req) {
    const token = await this.authService.login(req.user.id, req.user.email);
    return {user: req.user.id, token}
  }


  @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user ;
    }
}
