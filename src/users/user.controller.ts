import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.userService.searchUsers(keyword);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  async CreateUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    const currentUserId = req.user.userId || req.user.id;
    if (currentUserId !== id) {
      throw new ForbiddenException('Không được sửa profile của người khác');
    }
    return this.userService.update(id, dto, file);
  }

}
