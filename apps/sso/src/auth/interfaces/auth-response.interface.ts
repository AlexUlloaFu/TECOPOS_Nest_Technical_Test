import { Role } from '../../enums/role.enum';

export interface SafeTenant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  tenant: SafeTenant;
}
