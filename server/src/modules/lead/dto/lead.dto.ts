import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  IsArray,
  IsDate,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus, LeadTimeline } from '../interfaces';


export class LeadDto {
  @ApiProperty({ example: '5f9b2b3b1c9d440000d3e4a0' })
  @IsNotEmpty()
  @IsString()
  campaignID: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '0503198500284' })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  @MinLength(13)
  dni?: string;

  @ApiProperty({ example: '99339922' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'test@test.com' })
  @IsOptional()
  @IsEmail()
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

  @ApiProperty({ example: 'Llamar en 2 dias' })
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
  @MaxLength(13)
  @MinLength(13)
  dni?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

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

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // rejectedBanks?: string;

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
  dateToCall?: string

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
