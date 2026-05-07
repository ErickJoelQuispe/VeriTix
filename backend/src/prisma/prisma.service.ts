import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Logger para registrar eventos relacionados con la conexión a la base de datos
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Inicia el cliente de Prisma con el adaptador de PostgreSQL y la configuración de logging adecuada según el entorno.
   */
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error', 'warn'],
    });
  }

  /**
   * Conecta a la base de datos al iniciar el módulo
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Conexión exitosa');
  }

  /**
   * Desconecta de la base de datos al destruir el módulo
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
