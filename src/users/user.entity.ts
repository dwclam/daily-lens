import * as bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Role } from '../roles/role.enum';
import { Posts } from '../post/post.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'username', unique: true })
  username: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'bio', nullable: true })
  bio: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    default: Role.NOR,
  })
  role: Role;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
  @OneToMany(() => Posts, (post) => post.user)
  posts: Posts[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
