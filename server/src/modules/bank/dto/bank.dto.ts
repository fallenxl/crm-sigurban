import { IsArray, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { FinancialPlans } from '../interfaces';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BankDTO {
  @ApiProperty({ example: 'Banco Atlantida' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [
      {
        name: 'Cuenta de ahorro',
        description: 'Cuenta de ahorro con intereses',
        requirements: [
          'Copia de identidad',
          'Copia de RTN',
          'Copia de recibo de luz',
        ],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  financialPlans?: FinancialPlans[];

  @IsOptional()
  @IsArray()
  requirements?: string[];
}

export class UpdateBankDTO {
  @ApiProperty({ example: 'Banco Atlantida' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [
      {
        name: 'Cuenta de ahorro',
        description: 'Cuenta de ahorro con intereses',
        interestRate: 15,
      },
    ],
  })

  @IsOptional()
  @IsArray()
  @Type(() => FinancialPlans)
  financialPlans?: FinancialPlans[];

  @IsOptional()
  @IsArray()
  requirements?: string[];
}
