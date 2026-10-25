import { ApiProperty } from '@nestjs/swagger';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class UpdateCashPolicyDto {
  @ApiProperty({ example: '1000.00', description: 'Colchón de seguridad en decimal string', type: String })
  @IsDecimalString({ min: '0', maxDecimalPlaces: 2 })
  safetyBuffer!: string;

  @ApiProperty({ example: '5000.00', description: 'Límite de seguro en decimal string', type: String })
  @IsDecimalString({ min: '0', maxDecimalPlaces: 2 })
  insuranceLimit!: string;
}
