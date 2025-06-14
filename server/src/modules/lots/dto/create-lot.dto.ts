
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreateLotDto {
    @ApiProperty()
    @IsNotEmpty()
    lot: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    block?: string;

    @ApiProperty()
    @IsNumber()
    area: number;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status: string;

    @ApiProperty()
    @IsOptional()
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
