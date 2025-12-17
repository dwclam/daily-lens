
import { IsString, IsInt, Min, Max, IsOptional, IsBoolean } from "class-validator"
export class CreateUserDto {
  
    @IsString()
    username: string

    @IsString()
    email: string

    @IsString()
    password: string

    @IsString()
    @IsOptional()
    avatar: string

    @IsString()
    @IsOptional()
    bio: string

    @IsBoolean()
    isActive: boolean


}