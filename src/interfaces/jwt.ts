export interface JwtPayload {
  userId: string;
  userEmail: string;
  accountType: 'driver' | 'admin' | 'user';
}
