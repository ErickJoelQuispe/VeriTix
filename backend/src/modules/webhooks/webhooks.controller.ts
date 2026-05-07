import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import type { Stripe } from 'stripe';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import { StripeWebhookService } from './stripe-webhook.service';

@ApiExcludeController()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly config: ConfigService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const webhookSecret = this.config.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Raw body no disponible');
    }
    if (!signature) {
      throw new BadRequestException('stripe-signature header faltante');
    }

    // Verificar firma — lanza Error si la firma es inválida
    let event: { type: string; data: { object: any } };
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.warn(`Webhook signature inválida: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Despacho de eventos
    // Retornamos 200 aunque el handler falle — Stripe reintenta si recibe != 2xx
    // y puede generar loops infinitos. Mejor loguear y monitorear.
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.stripeWebhookService.handleCheckoutSessionCompleted(
            event.data.object,
          );
          break;

        case 'checkout.session.expired':
          await this.stripeWebhookService.handleCheckoutSessionExpired(
            event.data.object,
          );
          break;

        case 'payment_intent.payment_failed':
          await this.stripeWebhookService.handlePaymentIntentFailed(
            event.data.object,
          );
          break;

        case 'charge.refunded':
          await this.stripeWebhookService.handleChargeRefunded(
            event.data.object,
          );
          break;

        default:
          this.logger.debug(`Evento Stripe no manejado: ${event.type}`);
      }
    } catch (err: any) {
      this.logger.error(
        `Error procesando evento ${event.type}: ${err.message}`,
        err.stack,
      );
    }

    return { received: true };
  }
}
