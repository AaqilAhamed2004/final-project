import { ROLES } from '../constants';

export const users = [
  {
    id: 'USR-GN-01',
    name: 'A. Vance',
    email: 'gn@aura.gov',
    password: 'password123',
    role: ROLES.GN_OFFICER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vance&backgroundColor=1C1309',
    zone: 'Colombo District',
  },
  {
    id: 'USR-DN-01',
    name: 'Global Relief Corp',
    email: 'donor@aura.gov',
    password: 'password123',
    role: ROLES.DONOR,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Donor&backgroundColor=1C1309',
  },
  {
    id: 'USR-SA-01',
    name: 'Admin Alpha',
    email: 'admin@aura.gov',
    password: 'password123',
    role: ROLES.SUPER_ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha&backgroundColor=1C1309',
  }
];
