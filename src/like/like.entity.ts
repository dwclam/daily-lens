import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Posts } from '../post/post.entity';


@Entity('likes')
@Unique(['user', 'post']) // moi nguoi chi duoc like 1 bai
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;


  @ManyToOne(() => Posts, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Posts;
}