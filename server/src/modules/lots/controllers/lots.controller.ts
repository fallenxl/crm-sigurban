import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { LotsService } from '../services/lots.service';
import { CreateLotDto } from '../dto/create-lot.dto';
import * as cron from 'node-cron';

@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {
      cron.schedule('0 0 0 * * *', async () => {
        Promise.all([
          this.lotsService.releaseLotIfTenDaysPassed(),
        
        ])
      });
  }

  @Post()
  create(@Body() createLotDto: CreateLotDto) {
    return this.lotsService.create(createLotDto);
  }

  @Get("all")
  async findAll() {
    return await this.lotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(id);
  }

  @Get('project/:id')
  findAllByProject(@Param('id') id: string) {
    return this.lotsService.findAllByProject(id);
  }

  @Get('project/:id/:status')
  findAllByProjectAndStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.lotsService.findAllByProjectAndStatus(id, status);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLotDto: any) {
    return this.lotsService.update(id, updateLotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lotsService.remove(id);
  }

}
