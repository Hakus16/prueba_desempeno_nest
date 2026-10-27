import { Role } from '../constants/roles.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}
