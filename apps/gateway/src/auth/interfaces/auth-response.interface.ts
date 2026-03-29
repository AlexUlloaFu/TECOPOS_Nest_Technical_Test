import { Role } from './tenant-payload.interface';

export interface TenantSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  tenant: TenantSummary;
}
