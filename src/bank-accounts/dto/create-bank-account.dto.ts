import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Cuenta Principal' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Banco Popular' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId!: number;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
