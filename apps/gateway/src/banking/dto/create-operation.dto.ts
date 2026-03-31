import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateFinancialOperationDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 125.5 })
  @IsNumber()
  @Min(0)
  amount: number;
}
