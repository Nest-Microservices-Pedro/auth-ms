import { User } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JwtPayload extends Pick<User, 'id' | 'email' | 'name'> {}
