import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsString()
  @IsOptional()
  caption?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  isPublic?: boolean;
}