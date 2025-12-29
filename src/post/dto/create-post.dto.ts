import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePostDto {

  @IsString()
  @IsNotEmpty({ message: 'Image URL cannot be empty' })
  imageUrl: string;


  @IsString()
  @IsOptional()
  caption?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}