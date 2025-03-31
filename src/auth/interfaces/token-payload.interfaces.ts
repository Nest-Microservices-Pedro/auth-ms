import { User } from '@prisma/client';

export interface TokenPayload extends Pick<User, 'id' | 'email' | 'name'> {
  iat: string;
  exp: string;
  sub: string;
}
