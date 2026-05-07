import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { WebhooksController } from './webhooks.controller';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEST_WEBHOOK_SECRET = 'whsec_test_secret_1234567890abcdef';

// Crea un payload firmado usando la librería real de Stripe
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');
const stripeReal = new StripeLib('sk_test_dummy');

function buildSignedRequest(payload: object): {
  rawBody: Buffer;
  signature: string;
} {
  const rawBody = Buffer.from(JSON.stringify(payload));
  const signature = StripeLib.webhooks.generateTestHeaderString({
    payload: rawBody.toString(),
    secret: TEST_WEBHOOK_SECRET,
  });
  return { rawBody, signature };
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockStripeWebhookService = {
  handleCheckoutSessionCompleted: jest.fn(),
  handleCheckoutSessionExpired: jest.fn(),
  handlePaymentIntentFailed: jest.fn(),
  handleChargeRefunded: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue(TEST_WEBHOOK_SECRET),
};

// Mock del cliente Stripe que usa la verificación REAL de firma
const mockStripeClient = {
  webhooks: {
    constructEvent: (rawBody: Buffer, signature: string, secret: string) =>
      stripeReal.webhooks.constructEvent(rawBody, signature, secret),
  },
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let webhookService: typeof mockStripeWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: StripeWebhookService, useValue: mockStripeWebhookService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: STRIPE_CLIENT, useValue: mockStripeClient },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    webhookService = module.get(StripeWebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Firma inválida ────────────────────────────────────────────────────────

  describe('firma inválida', () => {
    it('should throw BadRequestException when rawBody is missing', async () => {
      const req = { rawBody: undefined } as any;
      await expect(controller.handleStripe(req, 'fake-sig')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when signature header is missing', async () => {
      const req = { rawBody: Buffer.from('{}') } as any;
      await expect(
        controller.handleStripe(req, undefined as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when signature is invalid', async () => {
      const req = { rawBody: Buffer.from('{"type":"test"}') } as any;
      await expect(
        controller.handleStripe(req, 'firma_invalida'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── checkout.session.completed ────────────────────────────────────────────

  describe('checkout.session.completed', () => {
    it('should call handleCheckoutSessionCompleted with event data', async () => {
      const sessionObject = {
        id: 'cs_test_session_1',
        payment_intent: 'pi_test_1',
        metadata: { orderId: 'uuid-order-1' },
      };
      const payload = {
        type: 'checkout.session.completed',
        data: { object: sessionObject },
      };
      const { rawBody, signature } = buildSignedRequest(payload);

      mockStripeWebhookService.handleCheckoutSessionCompleted.mockResolvedValue(
        undefined,
      );

      const result = await controller.handleStripe(
        { rawBody } as any,
        signature,
      );

      expect(result).toEqual({ received: true });
      expect(
        webhookService.handleCheckoutSessionCompleted,
      ).toHaveBeenCalledWith(sessionObject);
    });
  });

  // ── checkout.session.expired ──────────────────────────────────────────────

  describe('checkout.session.expired', () => {
    it('should call handleCheckoutSessionExpired with event data', async () => {
      const sessionObject = {
        id: 'cs_test_session_1',
        metadata: { orderId: 'uuid-order-1' },
      };
      const payload = {
        type: 'checkout.session.expired',
        data: { object: sessionObject },
      };
      const { rawBody, signature } = buildSignedRequest(payload);

      mockStripeWebhookService.handleCheckoutSessionExpired.mockResolvedValue(
        undefined,
      );

      const result = await controller.handleStripe(
        { rawBody } as any,
        signature,
      );

      expect(result).toEqual({ received: true });
      expect(webhookService.handleCheckoutSessionExpired).toHaveBeenCalledWith(
        sessionObject,
      );
    });
  });

  // ── payment_intent.payment_failed ─────────────────────────────────────────

  describe('payment_intent.payment_failed', () => {
    it('should call handlePaymentIntentFailed with event data', async () => {
      const intentObject = {
        id: 'pi_test_1',
        last_payment_error: { message: 'Sin fondos' },
      };
      const payload = {
        type: 'payment_intent.payment_failed',
        data: { object: intentObject },
      };
      const { rawBody, signature } = buildSignedRequest(payload);

      mockStripeWebhookService.handlePaymentIntentFailed.mockResolvedValue(
        undefined,
      );

      const result = await controller.handleStripe(
        { rawBody } as any,
        signature,
      );

      expect(result).toEqual({ received: true });
      expect(webhookService.handlePaymentIntentFailed).toHaveBeenCalledWith(
        intentObject,
      );
    });
  });

  // ── charge.refunded ───────────────────────────────────────────────────────

  describe('charge.refunded', () => {
    it('should call handleChargeRefunded with event data', async () => {
      const chargeObject = {
        payment_intent: 'pi_test_1',
      };
      const payload = {
        type: 'charge.refunded',
        data: { object: chargeObject },
      };
      const { rawBody, signature } = buildSignedRequest(payload);

      mockStripeWebhookService.handleChargeRefunded.mockResolvedValue(
        undefined,
      );

      const result = await controller.handleStripe(
        { rawBody } as any,
        signature,
      );

      expect(result).toEqual({ received: true });
      expect(webhookService.handleChargeRefunded).toHaveBeenCalledWith(
        chargeObject,
      );
    });
  });

  // ── evento no manejado ────────────────────────────────────────────────────

  describe('evento no manejado', () => {
    it('should return { received: true } for unknown event types', async () => {
      const payload = {
        type: 'customer.created',
        data: { object: { id: 'cus_test' } },
      };
      const { rawBody, signature } = buildSignedRequest(payload);

      const result = await controller.handleStripe(
        { rawBody } as any,
        signature,
      );

      expect(result).toEqual({ received: true });
      expect(
        webhookService.handleCheckoutSessionCompleted,
      ).not.toHaveBeenCalled();
    });
  });

  // ── resiliencia ante errores del handler ──────────────────────────────────

  describe('resiliencia', () => {
    it('should return { received: true } even when handler throws', async () => {
      mockStripeWebhookService.handleCheckoutSessionCompleted.mockRejectedValue(
        new Error('DB connection lost'),
      );

      const payload = {
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test', payment_intent: null, metadata: {} } },
      };
      const { rawBody, signature } = buildSignedRequest(payload);

      // NO debe lanzar — devuelve 200 siempre para evitar reintentos de Stripe
      const result = await controller.handleStripe(
        { rawBody } as any,
        signature,
      );

      expect(result).toEqual({ received: true });
    });
  });
});
