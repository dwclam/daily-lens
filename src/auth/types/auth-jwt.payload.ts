import { Role } from '../../roles/role.enum';

export type AuthJwtPayload = {
    sub: number;
    email: string;
    role: Role;
}