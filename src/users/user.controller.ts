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
  Put,
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
import { RolesGuard } from '../roles/role.guard';

@Controller('user')

export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.userService.searchUsers(keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  async CreateUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
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

  @Put(':id/role')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: Role) {
    return await this.userService.updateRole(id, role);
  }
}
