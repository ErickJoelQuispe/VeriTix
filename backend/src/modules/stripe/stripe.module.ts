import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Stripe } from 'stripe';

// Token de inyección — evita colisiones de nombre con la clase Stripe
export const STRIPE_CLIENT = 'STRIPE_CLIENT';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeConstructor = require('stripe');

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Stripe => {
        return new StripeConstructor(
          config.getOrThrow<string>('STRIPE_SECRET_KEY'),
          { apiVersion: '2025-05-28.basil' },
        ) as Stripe;
      },
    },
  ],
  exports: [STRIPE_CLIENT],
})
export class StripeModule {}
