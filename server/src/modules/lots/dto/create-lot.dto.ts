
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreateLotDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lot: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    block?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    area: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    reservedBy: string;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    reservationDate: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    projectID: string;
}
