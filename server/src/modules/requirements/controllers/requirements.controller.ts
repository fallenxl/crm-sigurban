import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RequirementsService } from '../services/requirements.service';
import { CreateRequirementDto } from '../dto/create-requirement.dto';
import { UpdateRequirementDto } from '../dto/update-requirement.dto';
import { AuthGuard } from 'src/modules/auth/guards';

@Controller('requirements')
@UseGuards(AuthGuard)
export class RequirementsController {
    constructor(private readonly requirementsService: RequirementsService) {}

    @Post()
    create(@Body() createRequirementDto: CreateRequirementDto) {
        return this.requirementsService.createRequirement(createRequirementDto);
    }

    @Get()
    findAll() {
        return this.requirementsService.getAllRequirements();
    }

    //Query params name or id
    @Get('search')
    search(@Query() query) {
        return this.requirementsService.searchRequirements(query);
    }

    @Patch(':name')
    update(@Param('name') name: string, @Body() updateRequirementDto: UpdateRequirementDto) {
        return this.requirementsService.updateRequirement(name, updateRequirementDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.requirementsService.removeRequirement(id);
    }
}
