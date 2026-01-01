import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Nội dung comment không được để trống' })
  content: string;

  @IsInt()
  @IsNotEmpty()
  postId: number; // ID của bài viết muốn comment
}