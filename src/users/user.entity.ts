import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, MissingPrimaryColumnError, ManyToMany, JoinTable, BeforeInsert } from 'typeorm';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number

    @Column({ name: 'username' })
    username: string

    @Column({ name: 'email' })
    email: string

    @Column({ name: 'password' })
    password: string

    @Column({ name: 'avatar' })
    avatar: string

    @Column({ name: 'bio' })
    bio: string

    @Column({ name: 'is_active' })
    isActive: boolean

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable() 
    roles: Role[]


    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password,10)
    }

}