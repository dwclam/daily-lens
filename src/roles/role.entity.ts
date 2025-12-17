import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEnum } from './role.enum';
import { User } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    unique: true,
  })
  name: RoleEnum;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
