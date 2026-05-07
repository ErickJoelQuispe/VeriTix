import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto';
import { OrderStatus } from '../../../generated/prisma/enums';

export class OrderEventQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filtrar por estado de la orden.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
