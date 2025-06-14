import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project } from '../schemas/project.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { CreateLotDto } from '../dto/create-lot.dto';
import { LotsService } from 'src/modules/lots/services/lots.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly lotService: LotsService,
  ) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      const projectFound = await this.findProjectByName(createProjectDto.name);
      if (projectFound)
        throw new ErrorManager({
          message: 'Project already exists',
          type: 'BAD_REQUEST',
        });
      const createdProject = new this.projectModel(createProjectDto);
      return await createdProject.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      return await this.projectModel.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: string) {
    try {
      return await this.projectModel.findById(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
                        

  async findModelsByProjectId(id: string) {
    try {
      return this.projectModel.findById(id).select(['models', 'name']);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findProjectByName(name: string): Promise<Project> {
    try {
      return await this.projectModel.findOne({ name });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      return await this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
        new: true,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteProject(id: string) {
    try {
      const lotsFound = await this.lotService.findAllByProject(id);
      if (lotsFound.length > 0) {
        throw new ErrorManager({
          message: 'El proyecto tiene lotes asociados, no se puede eliminar',
          type: 'BAD_REQUEST',
        });
      }

      return await this.projectModel.findByIdAndDelete(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
