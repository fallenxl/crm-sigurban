import { Test } from '@nestjs/testing';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { userStub } from './stubs/user.stub';
import { User } from '../schemas';
import { UserDTO } from '../dto/user.dto';
import { describe } from 'node:test';

jest.mock('../services/users.service');

describe('UserController', () => {
  let userController: UsersController;
  let userService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();
    userController = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('when getUser is called', () => {
      let user: User;
      beforeEach(async () => {
        jest
          .spyOn(userService, 'getUserById')
          .mockReturnValue(Promise.resolve(userStub()));
      });
      test('then it should call userService', async () => {
        user = await userController.getUser(userStub()._id);
        expect(userService.getUserById).toBeCalledWith(userStub()._id);
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('getAllUser', () => {
    describe('when getAllUser is called', () => {
      let users: User[];
      beforeEach(async () => {
        jest
          .spyOn(userService, 'getAllUser')
          .mockReturnValue(Promise.resolve([userStub()]));
      });

      test('then it should call userService', async () => {
        users = await userController.getAll();
        console.log(users);
        expect(userService.getAllUser).toBeCalled();
      });

      test('then it should return a list of users', () => {
        expect(users).toEqual([userStub()]);
      });
    });
  });

  describe('createUser', () => {
    describe('when createUser is called', () => {
      let user: User;
      beforeEach(async () => {
        jest
          .spyOn(userService, 'createUser')
          .mockReturnValue(Promise.resolve(userStub()));
      });

      test('then it should call userService', async () => {
        user = await userController.register(userStub() as UserDTO);
        expect(userService.createUser).toBeCalledWith(userStub());
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('updateUser', () => {
    describe('when updateUser is called', () => {
      let user: User;
      beforeEach(async () => {
        jest.spyOn(userService, 'updateUserById').mockReturnValue(
          Promise.resolve({
            ...userStub(),
            name: 'updated name',
          }),
        );
      });

      test('then it should call userService', async () => {
        user = await userController.editUser(
          userStub() as UserDTO,
          userStub()._id,
        );
        expect(userService.updateUserById).toBeCalledWith(
          userStub()._id,
          userStub(),
        );
      });

      test('then it should return a user', () => {
        expect(user).toEqual({
          ...userStub(),
          name: 'updated name',
        });
      });
    });
  });

  describe('deleteUser', () => {
    describe('when deleteUser is called', () => {
      let user: User;

      beforeEach(async () => {
        jest.spyOn(userService, 'deleteUserById').mockReturnValue(
          Promise.resolve({
            ...userStub(),
            name: 'deleted name',
          }),
        );
      });

      test('then it should call userService', async () => {
        user = await userController.deleteUser(userStub()._id);
        expect(userService.deleteUserById).toBeCalledWith(userStub()._id);
      });

      test('then it should return a user', () => {
        expect(user).toEqual({
          ...userStub(),
          name: 'deleted name',
        });
      });
    });
  });
});
