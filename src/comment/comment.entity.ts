import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Posts } from '../post/post.entity';

@Entity('comments') 
export  class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // @Column({ default: false })
  // isEdited: boolean;

  @ManyToOne(() => User, (user) => user.comments, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Posts, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Posts;

}
