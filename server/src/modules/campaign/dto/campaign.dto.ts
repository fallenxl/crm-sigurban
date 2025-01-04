import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus } from '../interfaces';
export class CampaignDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UpdateCampaignDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  endDate?: string;
}
