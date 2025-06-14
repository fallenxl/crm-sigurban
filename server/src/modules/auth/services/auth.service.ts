import { Global, Inject, Injectable, Scope } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // Import JWT library for token operations
import * as bcrypt from 'bcrypt'; // Import bcrypt library for password hashing
import * as dotenv from 'dotenv'; // Import dotenv for environment variable access
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../users/schemas';
import { UsersService } from '../../users/services/users.service';
import { AuthResponse, PayloadToken } from '../interfaces/auth.interfaces'; // Import custom authentication interfaces
dotenv.config(); // Load environment variables from .env file

@Global() // Indicates that this service should be available globally in the application
@Injectable({ scope: Scope.REQUEST }) // Injectable service with request scope
export class AuthService {
  constructor(
    private readonly userService: UsersService, // Inject UsersService for user-related operations
    @Inject(REQUEST) private readonly request: Request, // Inject the current HTTP request object
  ) {}

  // Validate user credentials (email and password) for authentication
  public async validateUser(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    try {
      // Find the user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return undefined; // User not found, return undefined
      }

      if (!user.status) {
        return undefined;
      }

      // Compare the provided password with the hashed password stored in the database
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return undefined; // Password does not match, return undefined
      }
      return user; // Return the user if credentials are valid
    } catch (error) {
      return null; // Return null in case of an error
    }
  }

  // Refresh the authentication token for the current user
  public async refreshToken(): Promise<AuthResponse> {
    try {
      // Retrieve the user using the ID from the request
      const user = await this.userService.getUserById(this.request.idUser);
      if (!user) {
        return null; // User not found, return null
      }
      // Generate a new authentication token for the user
      return await this.generateToken(user);
    } catch (error) {
      return null; // Return null in case of an error
    }
  }

  // Sign a JSON Web Token (JWT) using a given payload
  public async signJWT({ payload }: { payload: PayloadToken }) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h', // Set the expiration time for the token (1 day)
    });
  }

  // Generate an authentication token for a user
  public async generateToken(user: any): Promise<AuthResponse> {
    // Retrieve the user from the database again to ensure consistency
    const getUser = await this.userService.getUserById(user._id);
    // Define the payload for the JWT
    const payload: PayloadToken = {
      sub: getUser._id.toString(),
      role: getUser.role,
    };
    // Sign the JWT with the payload and return it along with the user data
    return {
      accessToken: await this.signJWT({ payload }),
      user: getUser,
    };
  }

  async generateTokenByUser(): Promise<AuthResponse> {
    const user = await this.userService.getUserById(this.request.idUser);
    if (!user) {
      return null;
    }
    const payload = {
      sub: user._id.toString(),
      role: user.role,
    }
    return {
      accessToken: jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '3000d',
      }),
      user: user,
    }
  }
}
