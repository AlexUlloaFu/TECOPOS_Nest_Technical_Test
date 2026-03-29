import { Request } from 'express';
import { TenantPayload } from './tenant-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: TenantPayload;
}
