import { Roles } from '../../../constants';
import { User } from '../../users/schemas';

export interface PayloadToken {
  sub: string;
  role: Roles;
}
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthTokenResult {
  role: Roles;
  sub: string;
  iat: string;
  exp: string;
}
export interface IUseToken {
  role: Roles;
  sub: string;
  isExpired: boolean;
}
