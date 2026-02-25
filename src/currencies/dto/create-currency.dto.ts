import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Dólar Estadounidense' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '$' })
  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
