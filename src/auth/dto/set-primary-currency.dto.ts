import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class SetPrimaryCurrencyDto {
  @ApiProperty({ example: 1, description: 'ID de la moneda principal' })
  @IsInt()
  @IsNotEmpty()
  primaryCurrencyId!: number;
}
