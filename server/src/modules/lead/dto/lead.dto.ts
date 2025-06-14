import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  IsArray,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus, LeadTimeline } from '../interfaces';

export class LeadChatbotDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '99339922' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '0508200000xxx'})
  @IsNotEmpty()
  @IsString()
  dni?: string;

  @ApiProperty()
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty()
  genre?: string;

  @ApiProperty()
  @IsOptional()
  
  source?: string;

  @ApiProperty()
  @IsOptional()
  timeline?: Array<LeadTimeline>;

  @ApiProperty()
  @IsOptional()
  advisorID?: string;

}

export class LeadDto {
  @ApiProperty({ example: '5f9b2b3b1c9d440000d3e4a0' })
  @IsOptional()
  @IsString()
  campaignID?: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '0503198500284' })
  @IsOptional()
  dni?: string;

  @IsOptional()
  passport?: string;

  @IsOptional()
  residenceNumber?: string;

  @ApiProperty({ example: 'M' })
  genre?: string;

  @ApiProperty({ example: '99339922' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'test@test.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Av. Javier Prado 2323' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({})
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({})
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ example: 'Comprar Lote' })
  @IsOptional()
  @IsString()
  interestedIn?: string;

  @ApiProperty({ example: 'Llamar en 2 Dias' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'PENDING' })
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ example: '5f9b2b3b1c9d440000d3e4a0' })
  @IsOptional()
  @IsString()
  advisorID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birthdate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  workActivity?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  workPosition?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  workAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  workTime?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  timeline: Array<LeadTimeline>;
}

export class UpdateLeadDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birthdate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  passport?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  residenceNumber?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  genre?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;


  @ApiProperty({})
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({})
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  source?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  interestedIn?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentMethod?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  workPosition?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  workAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  workTime?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiProperty()
  @IsOptional()
  timeline?: Array<LeadTimeline>;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bankID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  financingProgram?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  updatedColumns?: Array<string>;
}

export class LeadStatusDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  advisorID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  managerID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bankManagerID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bankID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  financingProgram?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dateToCall?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  projectID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lotID?: string;

  @ApiProperty()
  @IsOptional()
  houseModel?: {
    model: string;
    price: number;
    area: number;
    priceWithDiscount: number;
  };

  @ApiProperty()
  @IsOptional()
  documents?: string[];

  @ApiProperty()
  @IsOptional()
  approved: string;

  @ApiProperty()
  @IsOptional()
  sameFinancialInstitutionContinues: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  whoIsResponsible?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class LeadAdvisorToAssignedDTO {
  @ApiProperty()
  @IsString()
  advisorID: string;
}

export class LeadCampaignToAssignedDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  campaignID: string;
}
