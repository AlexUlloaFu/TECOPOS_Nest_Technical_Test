import { Role } from '../../enums/role.enum';

export interface TenantPayload {
  sub: string;
  email: string;
  role: Role;
}
