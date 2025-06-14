import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { SettingsDTO, UserDTO, UserUpdateDTO } from '../dto/user.dto';
import { AdminAccess } from '../../auth/decorators';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../../constants';
import {Roles as ROLES} from '../../auth/decorators'
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
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



  @Get('/advisors/all')
  public async getAllAdvisors() {
    return await this.userService.getUsersAsAdvisor();
  }

  
  @Get('/advisors')
  public async getAdvisors() {
    return await this.userService.getUsersByRole(Roles.ADVISOR);
  }

  @Get('/managers')
  public async getManagers() {
    return await this.userService.getUsersByRole(Roles.MANAGER);
  }

W
  @Get(':id')
  public async getUser(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Put('edit/:id')
  public async editUser(@Body() body: UserUpdateDTO, @Param('id') id: string) {
    return await this.userService.updateUserById(id, body);
  }

  @Put('edit/settings/:id')
  public async editUserSettings(@Body() body:SettingsDTO, @Param('id') id: string) {
    return await this.userService.updateUserSettings(id, body);
  }

  @Get('settings/:id')
  public async getUserSettings(@Param('id') id: string) {
    return await this.userService.getUserSettings(id);
  }


  @Get('settings/autoassign/:id')
  public async getUserAutoAssign(@Param('id') id: string) {
    return await this.userService.getUserAutoAssign(id);
  }

  @Put('settings/autoassign/:id')
  public async editUserAutoAssign(@Param('id') id: string) {
    return await this.userService.toggleAutoAssign(id);
  }
  
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

  @Post('edit/avatar/:id')
  @UseInterceptors(FileInterceptor('file',{
    storage: diskStorage({
      destination: './avatars',
      filename: (req, file, cb) => {
const extension = extname(file.originalname);
        cb(null, "avatar-"+req.params.id+extension);
      },
    }),
  }))
  public async editUserAvatar(@Param('id') id: string, @UploadedFile() file:Express.Multer.File, @Request() req) {
    if(!file){
     return {error:'No file uploaded'}
    }
 
    const imgUrl = `${process.env.BASE_URL}avatar/${file.filename}`;
    console.log(imgUrl);
    return await this.userService.setUserAvatar(id, imgUrl);
  }

}
