import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'username', 'avatar', 'bio', 'createdAt','followersCount',
        'followingCount']
    });
    if (!user) {
      throw new NotFoundException('User with ID =  ' + id + ' not found ');
    }
    return user;
  }

  async findAll() {
    return this.userRepo.find({
      select: ['id', 'username', 'avatar', 'bio', 'createdAt','followersCount',
        'followingCount']
    });
  }
  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({
      where: {
        email,
      },
    });
  }
  async searchUsers(keyword: string) {
    if (!keyword) return [];

    return await this.userRepo.find({
      where: [
        { username: ILike(`%${keyword}%`) }
      ],
      select: ['id', 'username', 'avatar', 'email', 'followersCount']
    });
  }
  async update(id: number, dto: UpdateUserDto, file?: Express.Multer.File) {
    const user = await this.findOne(id);

    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.userRepo.findOne({ where: { username: dto.username } });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }
    if (file) {
      const baseUrl = 'http://localhost:3000';
      const avatarUrl = `${baseUrl}/uploads/${file.filename}`;
      dto.avatar = avatarUrl;
    }
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }
}
