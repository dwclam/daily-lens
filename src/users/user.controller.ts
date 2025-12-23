import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Roles } from "../roles/roles.decorator";
import { RoleEnum } from "src/roles/role.enum";

@Controller('user') 
export class UserController {
    constructor(private readonly userService : UserService) {}

    @Get() 
    findAll() {
        return this.userService.findAll() ;
    }
    
    //@Roles(RoleEnum.ADMIN)
    @Post()
    async CreateUser(@Body() dto: CreateUserDto){
        return this.userService.create(dto);
    }

    
}