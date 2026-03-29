export type Role = 'admin' | 'user';

export interface TenantPayload {
  sub: string;
  email: string;
  role: Role;
}
