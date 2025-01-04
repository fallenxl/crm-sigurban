import { Roles } from '../../../../constants';
import { User } from '../../schemas';

export const userStub = (): User => {
  return {
    _id: '6509df42c9f51454a4ded848',
    name: 'Axl Santos',
    email: 'axlsntz.dev@gmail.com',
    password: 'Santos_10',
    position: 'Owner',
    address: 'Rio Lindo',
    city: 'San Francisco de Yojoa',
    department: 'Cortes',
    phone: '+504 99329111',
    genre: 'Hombre',
    role: Roles.ADMIN,
  };
};
