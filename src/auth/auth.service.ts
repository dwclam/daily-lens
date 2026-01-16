import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwt.payload';
import type { ConfigType } from '@nestjs/config';
import refreshJwtConfig from '../config/refresh-jwt.config';
import type refreshJwtConfigType from '../config/refresh-jwt.config';
import { Role } from '../roles/role.enum';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfigType>,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const isPasswordMatch = await compare(pass, user.password);

    if (!isPasswordMatch)
      throw new UnauthorizedException('Incorrect email or password');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  } // tự gắn vào Req user

  login(userId: number, email: string, username: string, avatar: string, role : Role) {
    const payload: AuthJwtPayload = { sub: userId, email: email, role: role };
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return {
      id: userId,
      token,
      refreshToken,
      username : username,
      avatar : avatar,
      role : role,
    };
  }
  refreshToken(userId: number, email: string, role : Role) {
    const payload: AuthJwtPayload = { sub: userId, email: email , role: role };
    const token = this.jwtService.sign(payload);

    return {
      id: userId,
      email: email,
      token,
    };
  }
}
