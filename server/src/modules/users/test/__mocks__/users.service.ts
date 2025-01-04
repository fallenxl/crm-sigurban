import { userStub } from '../stubs/user.stub';

export const UsersService = jest.fn().mockReturnValue({
  getUserById: jest.fn().mockReturnValue(userStub()),
  getAllUser: jest.fn().mockReturnValue([userStub()]),
  createUser: jest.fn().mockReturnValue(userStub()),
  updateUserById: jest.fn().mockReturnValue(userStub()),
  deleteUserById: jest.fn().mockReturnValue(userStub()),
});
