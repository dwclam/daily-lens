import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from "./dto/create-user.dto";
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) { }

    async create(dto: CreateUserDto) {
        const user = this.userRepo.create(dto)
        return this.userRepo.save(user);
    }

    async findOne(id: number) {
        const user = await this.userRepo.findOne({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException('User with ID =  ' + id + ' not found ');
        }
    }

    async findAll() {
        return this.userRepo.find() ;
    }

    async findByEmail(email : string) {
        return await this.userRepo.findOne({
            where :{
                email
            }
        })
    }




}