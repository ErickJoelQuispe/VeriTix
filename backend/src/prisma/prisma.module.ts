import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// El decorador @Global hace que este módulo sea global, lo que significa que sus proveedores estarán disponibles en toda la aplicación sin necesidad de importarlo explícitamente en otros módulos.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
