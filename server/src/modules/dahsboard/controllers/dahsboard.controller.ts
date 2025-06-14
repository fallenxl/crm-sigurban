import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { DahsboardService } from '../services/dahsboard.service';
import { LeadService } from 'src/modules/lead/services/lead.service';
import { AuthGuard } from 'src/modules/auth/guards';
import { Response } from 'express';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DahsboardController {
  constructor(
    private readonly leadService:LeadService,
  ) {}

  @Get() 
  async getDashboardData(@Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {

    return this.leadService.getDashboardData({startDate , endDate});
  }

  @Post('export')
  async exportData(@Body() body, @Res() res:Response) {

    const dataBuffer = await this.leadService.exportData(body.format);
   const extension = body.format === 'excel' ? 'xlsx' : body.format;
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=report.${extension}`,
      'Content-Length': dataBuffer.length,
    })
    res.end(dataBuffer);
  }
}
