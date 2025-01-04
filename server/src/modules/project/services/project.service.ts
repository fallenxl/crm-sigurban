import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project } from '../schemas/project.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { CreateLotDto } from '../dto/create-lot.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
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

  async createLot(
    projectId: string,
    createLotDto: CreateLotDto,
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(projectId);
      return await project.save();
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

  async findOne(id: string): Promise<Project> {
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
}
