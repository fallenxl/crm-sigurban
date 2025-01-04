import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RolesGuard } from 'src/modules/auth/guards';
import { BankService } from '../services';
import { BankDTO, UpdateBankDTO } from '../dto';

@ApiTags('Bank (Admin, Gestor Bancario)')
@ApiHeader({ name: 'authorization', description: 'Bearer token' })
@Controller('banks')
@UseGuards(AuthGuard, RolesGuard)
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  async createBank(@Body() bank: BankDTO) {
    return await this.bankService.createBank(bank);
  }

  @Get()
  async getAllBanks() {
    return await this.bankService.getAllBanks();
  }

  @Get(':bankId')
  async getBankById(@Param('bankId') bankId: string) {
    return await this.bankService.getBankById(bankId);
  }

  @Put(':bankId')
  async updateBank(
    @Param('bankId') bankId: string,
    @Body() bank: UpdateBankDTO,
  ) {
    return await this.bankService.updateBank(bankId, bank);
  }

  @Delete(':bankId')
  async deleteBank(@Param('bankId') bankId: string) {
    return await this.bankService.deleteBank(bankId);
  }
}
