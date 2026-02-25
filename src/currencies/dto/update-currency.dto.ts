import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateCurrencyDto } from './create-currency.dto';

export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
