import { ApiProperty } from "@nestjs/swagger";
import { lotStatus } from "../interfaces/project.interfaces";
import { IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLotDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    area: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status: lotStatus;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    model: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    reservationDate: Date;


}