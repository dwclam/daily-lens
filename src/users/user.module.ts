import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Role } from "../roles/role.entity";
import { Module } from "@nestjs/common";


@Module({
  imports: [TypeOrmModule.forFeature([User,Role])],
  controllers: [UserController],
  providers: [UserService],

})
export class UserModule {
  
}
