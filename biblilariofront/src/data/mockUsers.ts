export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  registeredDate: string;
  isGlobalAdmin: boolean;
  isSuperAdmin: boolean;
  isBlocked: boolean;
  lastLogin: string;
}