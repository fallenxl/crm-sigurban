import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthDTO } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public async login(@Body() { email, password }: AuthDTO) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return await this.authService.generateToken(user);
  }

  @Get('refresh-token')
  @ApiHeader({ name: 'authorization', description: 'Bearer token' })
  @UseGuards(AuthGuard)
  public async refreshToken() {
    return await this.authService.refreshToken();
  }

  @Get('generate-token')
  @ApiHeader({ name: 'authorization', description: 'Bearer token' })
  @UseGuards(AuthGuard)
  public async generateToken() {
    return await this.authService.generateTokenByUser();
  }
}
