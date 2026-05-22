import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { SignJWT } from 'jose';

// Bun auto-carga el archivo .env si lo ejecutamos desde el directorio backend

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function simulate() {
  console.log('--- Iniciando Simulación de Validación en Vivo ---');
  console.log('Evento: Tech Live Demo Expo 2026 — 25 Jun 2026, 18:00 hs (AR)');
  console.log('Target: 1500 tickets en 5 minutos (3 validaciones simultáneas)\n');

  const event = await prisma.event.findFirst({
    where: { name: 'Tech Live Demo Expo 2026' }
  });

  if (!event) {
    console.error('No se encontró el evento "Tech Live Demo Expo 2026". Ejecuta el seed primero.');
    process.exit(1);
  }

  const tickets = await prisma.ticket.findMany({
    where: { eventId: event.id, status: 'ACTIVE' },
    take: 1500
  });

  if (tickets.length === 0) {
    console.error('No hay tickets activos para este evento.');
    process.exit(1);
  }

  console.log(`Se encontraron ${tickets.length} tickets activos. Comenzando flujo de entrada...\n`);

  const validator = await prisma.user.findFirst({
    where: { email: 'validator@veritix.app' }
  });

  if (!validator) {
    console.error('No se encontró el usuario validador.');
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('No se encontró JWT_SECRET en las variables de entorno (.env).');
    process.exit(1);
  }

  const secretKey = new TextEncoder().encode(jwtSecret);
  const issuer = process.env.JWT_ISSUER || 'veritix-api';

  const token = await new SignJWT({ email: validator.email, role: validator.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(validator.id)
    .setIssuedAt()
    .setIssuer(issuer)
    .setExpirationTime('2h')
    .sign(secretKey);

  const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

  // 1500 tickets en 5 minutos con batches de 3 concurrentes
  // 1500 / 3 = 500 batches en 300 seg → 1 batch cada 600ms
  const TOTAL_TICKETS  = tickets.length;   // 1500
  const CONCURRENCY    = 3;                // validaciones simultáneas
  const DURATION_MS    = 5 * 60 * 1000;   // 5 minutos
  const TOTAL_BATCHES  = Math.ceil(TOTAL_TICKETS / CONCURRENCY); // 500
  const intervalMs     = Math.floor(DURATION_MS / TOTAL_BATCHES); // 600ms entre batches

  console.log(`Configuración de la simulación:`);
  console.log(`  Total tickets : ${TOTAL_TICKETS}`);
  console.log(`  Duración      : 5 minutos`);
  console.log(`  Concurrencia  : ${CONCURRENCY} simultáneas`);
  console.log(`  Intervalo     : ${intervalMs}ms entre batches`);
  console.log(`  Throughput    : ~${(CONCURRENCY * 1000 / intervalMs).toFixed(1)} tickets/seg`);
  console.log(`  API           : ${API_URL}\n`);

  let successCount = 0;
  let errorCount   = 0;
  const startTime  = Date.now();

  async function validateTicket(ticket: typeof tickets[0], index: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tickets/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payload: ticket.qrPayload })
      });

      if (response.ok) {
        successCount++;
        process.stdout.write('✅ ');
      } else {
        errorCount++;
        const errData = await response.json().catch(() => ({}));
        console.error(`\n❌ Error ticket ${ticket.id}: ${JSON.stringify(errData)}`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`\n❌ Error de red: `, error.message);
    }
  }

  // Procesar en batches de CONCURRENCY tickets simultáneos
  for (let i = 0; i < tickets.length; i += CONCURRENCY) {
    const batch = tickets.slice(i, i + CONCURRENCY);

    // Lanzar el batch en paralelo
    await Promise.all(batch.map((ticket, j) => validateTicket(ticket, i + j)));

    // Progreso cada 150 tickets (50 batches)
    const processed = Math.min(i + CONCURRENCY, TOTAL_TICKETS);
    if (processed % 150 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`\n  [${processed}/${TOTAL_TICKETS}] ${successCount} válidos — ${elapsed}s transcurridos`);
    }

    // Esperar entre batches (excepto el último)
    if (i + CONCURRENCY < tickets.length) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n\n══════════════════════════════════════');
  console.log('         SIMULACIÓN COMPLETADA         ');
  console.log('══════════════════════════════════════');
  console.log(`  Tickets validados : ${successCount} / ${TOTAL_TICKETS}`);
  console.log(`  Errores           : ${errorCount}`);
  console.log(`  Tiempo total      : ${totalElapsed}s`);
  console.log('══════════════════════════════════════\n');
}

simulate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
