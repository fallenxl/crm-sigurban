import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,

  UseGuards,
  Put,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RolesGuard } from 'src/modules/auth/guards';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {
  }

  @Post()
  async create(@Body() createProjectDto: any) {
    return await this.projectService.createProject(createProjectDto);
  }

  @Get()
  async findAll() {
    return await this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.projectService.findOne(id);
  }

  @Get('models/:id')
  async findModelsByProjectId(@Param('id') id: string) {
    return await this.projectService.findModelsByProjectId(id);
  }
  
  
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: any) {
    return await this.projectService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.projectService.deleteProject(id);
  }

}
