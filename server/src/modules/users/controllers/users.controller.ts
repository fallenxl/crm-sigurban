import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserDTO, UserUpdateDTO } from '../dto/user.dto';
import { AdminAccess } from '../../auth/decorators';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../../constants';
import {Roles as ROLES} from '../../auth/decorators'
@ApiHeader({ name: 'authorization', description: 'Bearer token' })
@ApiTags('Users (Admin)')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private userService: UsersService) { }

  @AdminAccess()
  @Post('register')
  public async register(@Body() body: UserDTO) {
    return await this.userService.createUser(body);
  }

  @AdminAccess()
  @Get()
  @ROLES(Roles.BANK_MANAGER,Roles.ADVISOR,Roles.MANAGER,Roles.RECEPTIONIST)
  @ApiQuery({ name: 'role', enum: Roles, required: false })
  public async getAll(@Query('role') role?: Roles) {
    if (role) {
      return this.userService.getUsersByRole(role);
    }
    return await this.userService.getAllUser();
  }

  
  @Get('/advisors')
  public async getAdvisors() {
    return await this.userService.getUsersByRole(Roles.ADVISOR);
  }

  @Get('/managers')
  public async getManagers() {
    return await this.userService.getUsersByRole(Roles.MANAGER);
  }

  @AdminAccess()
  @Get(':id')
  public async getUser(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @AdminAccess()
  @Put('edit/:id')
  public async editUser(@Body() body: UserUpdateDTO, @Param('id') id: string) {
    return await this.userService.updateUserById(id, body);
  }

  @Get('settings/autoassign/:id')
  public async getUserAutoAssign(@Param('id') id: string) {
    return await this.userService.getUserAutoAssign(id);
  }

  @Put('settings/autoassign/:id')
  public async editUserAutoAssign(@Param('id') id: string) {
    return await this.userService.toggleAutoAssign(id);
  }
  

  @AdminAccess()
  @Put('edit/password/:id')
  public async editUserPassword(
    @Body() body: { password: string },
    @Param('id') id: string,
  ) {
    return await this.userService.updateUserPassword(id, body.password);
  }

  @AdminAccess()
  @Delete('delete/:id')
  public async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUserById(id);
  }

  // get the last advisor to assign a lead
  @Get('/advisors/last')
  public async getLastAdvisor() {
    return await this.userService.getLastAdvisor();
  }

}
