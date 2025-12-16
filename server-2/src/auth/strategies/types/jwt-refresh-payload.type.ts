import { User } from '@/users/domain/user';

export type JwtRefreshPayloadType = {
  userId: User['id'];
};
