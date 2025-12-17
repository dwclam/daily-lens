import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwt.payload';

@Injectable()
export class AuthService {
    constructor(private userService : UserService, private jwtService : JwtService) {}

    async validateUser(email:string,pass:string) {
        const user = await this.userService.findByEmail(email)
        if(!user) {
            throw new UnauthorizedException("Incorrect email or password");
        }

        const isPasswordMatch = await compare(pass,user.password) ;

        if(!isPasswordMatch) throw new UnauthorizedException('Incorrect email or password')

        const { password, ...result } = user;

        return result ;

    }

    async login(userId : number, email : string) {
        const payload : AuthJwtPayload = { sub: userId, email:email };
        return {
            access_token : this.jwtService.sign(payload)
        }
    }

}
