import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RolesGuard } from 'src/modules/auth/guards';
import { AdminAccess, Roles } from 'src/modules/auth/decorators';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @AdminAccess()
  async create(@Body() createProjectDto: any) {
    return await this.projectService.createProject(createProjectDto);
  }


  @Get()
  @AdminAccess()
  @Roles('ADVISOR')
  async findAll() {
    return await this.projectService.findAll();
  }

  @Get('models/:id')
  @AdminAccess()
  @Roles('ADVISOR')
  async findModelsByProjectId(@Param('id') id: string) {
    return await this.projectService.findModelsByProjectId(id);
  }

}
