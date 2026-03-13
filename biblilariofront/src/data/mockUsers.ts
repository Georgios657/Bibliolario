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

export const mockUsers: User[] = [
  {
    id: 'superadmin',
    name: 'Super Administrator',
    email: 'superadmin@buchclub.de',
    password: 'super123',
    registeredDate: '01.10.2025',
    isGlobalAdmin: true,
    isSuperAdmin: true,
    isBlocked: false,
    lastLogin: '30.01.2026 16:00',
  },
  {
    id: 'admin',
    name: 'Administrator',
    email: 'admin@buchclub.de',
    password: 'admin123',
    registeredDate: '01.11.2025',
    isGlobalAdmin: true,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '30.01.2026 15:00',
  },
  {
    id: 'max',
    name: 'Max',
    email: 'max@buchclub.de',
    password: 'test123',
    registeredDate: '01.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '30.01.2026 14:30',
  },
  {
    id: 'user2',
    name: 'Anna Schmidt',
    email: 'anna@buchclub.de',
    password: 'password123',
    registeredDate: '05.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '30.01.2026 11:20',
  },
  {
    id: 'user3',
    name: 'Thomas Müller',
    email: 'thomas@buchclub.de',
    password: 'password123',
    registeredDate: '10.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '29.01.2026 16:45',
  },
  {
    id: 'user4',
    name: 'Lisa Weber',
    email: 'lisa@buchclub.de',
    password: 'password123',
    registeredDate: '12.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '29.01.2026 09:30',
  },
  {
    id: 'user5',
    name: 'Peter Klein',
    email: 'peter@buchclub.de',
    password: 'password123',
    registeredDate: '15.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '28.01.2026 20:15',
  },
  {
    id: 'user6',
    name: 'Sarah Becker',
    email: 'sarah@buchclub.de',
    password: 'password123',
    registeredDate: '18.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '30.01.2026 08:00',
  },
  {
    id: 'user7',
    name: 'Julia Wagner',
    email: 'julia@buchclub.de',
    password: 'password123',
    registeredDate: '20.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: false,
    lastLogin: '27.01.2026 13:20',
  },
  {
    id: 'user8',
    name: 'Michael Fischer',
    email: 'michael@buchclub.de',
    password: 'password123',
    registeredDate: '22.12.2025',
    isGlobalAdmin: false,
    isSuperAdmin: false,
    isBlocked: true,
    lastLogin: '25.01.2026 19:45',
  },
];