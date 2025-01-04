import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bank } from '../schemas';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { BankDTO, UpdateBankDTO } from '../dto';

@Injectable()
export class BankService {
  constructor(
    @InjectModel(Bank.name) private readonly bankModel: Model<Bank>,
  ) {}

  async createBank(bank: BankDTO): Promise<Bank> {
    try {
      const bankFound = await this.getBankByName(bank.name);
    console.log(bankFound);
      if (bankFound) {
        throw new ErrorManager({
          type: 'CONFLICT',
          message: 'Bank already exists',
        });
      }
      const newBank = new this.bankModel(bank);

      return newBank.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getAllBanks(): Promise<Bank[]> {
    try {
      return await this.bankModel.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getBankById(id: string): Promise<Bank> {
    try {
      return await this.bankModel.findById(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getBankByName(name: string): Promise<Bank> {
    try {
      return await this.bankModel.findOne({ name });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateBank(id: string, bank: UpdateBankDTO): Promise<Bank> {
    try {
      const bankFound = await this.getBankById(id);
      if (!bankFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Bank not found',
        });
      }
      return await this.bankModel.findByIdAndUpdate(id, bank, { new: true });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteBank(id: string){
    try {
      const bankFound = await this.getBankById(id);
      if (!bankFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Bank not found',
        });
      }
      return await this.bankModel.findByIdAndDelete(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async bankExists(id: string): Promise<Bank> {
    try {
      const bankFound = await this.getBankById(id);
      if (!bankFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Bank not found',
        });
      }
      
      return bankFound;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
