import { ApiProperty } from '@nestjs/swagger';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class UpdateExchangeRateDto {
  @ApiProperty({ example: '200.00', description: 'Tasa de referencia en decimal string', type: String })
  @IsDecimalString({ min: '0' })
  referenceRate!: string;

  @ApiProperty({ example: '0.05', description: 'Margen de compra en decimal string', type: String })
  @IsDecimalString({ min: '0', max: '1' })
  buyMargin!: string;

  @ApiProperty({ example: '0.05', description: 'Margen de venta en decimal string', type: String })
  @IsDecimalString({ min: '0', max: '1' })
  sellMargin!: string;
}
