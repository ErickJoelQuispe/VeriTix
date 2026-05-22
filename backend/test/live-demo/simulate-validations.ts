import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { SignJWT } from 'jose';

// Bun auto-carga el archivo .env si lo ejecutamos desde el directorio backend

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function simulate() {
  console.log('--- Iniciando Simulación de Validación en Vivo ---');
  console.log('Evento: Tech Live Demo Expo 2026 — 25 Jun 2026, 18:00 hs (AR)');
  console.log('Target: 500 tickets en 10 minutos (~1 ticket cada 1.2 seg)\n');

  const event = await prisma.event.findFirst({
    where: { name: 'Tech Live Demo Expo 2026' }
  });

  if (!event) {
    console.error('No se encontró el evento "Tech Live Demo Expo 2026". Ejecuta el seed primero.');
    process.exit(1);
  }

  // Toma exactamente 500 tickets ACTIVE — los que van a entrar en la demo
  const tickets = await prisma.ticket.findMany({
    where: {
      eventId: event.id,
      status: 'ACTIVE'
    },
    take: 500
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

  const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

  // 500 tickets en 600 segundos (10 minutos) = 1 ticket cada 1200ms
  // Esto simula flujo normal de entrada real de personas al venue
  const TOTAL_TICKETS = tickets.length;          // 500
  const DURATION_MS   = 10 * 60 * 1000;         // 10 minutos en ms
  const intervalMs    = Math.floor(DURATION_MS / TOTAL_TICKETS); // 1200ms

  const durationMin = Math.round(DURATION_MS / 60000);
  console.log(`Configuración de la simulación:`);
  console.log(`  Total tickets : ${TOTAL_TICKETS}`);
  console.log(`  Duración      : ${durationMin} minutos`);
  console.log(`  Intervalo     : ${intervalMs}ms entre validaciones`);
  console.log(`  Throughput    : ${(1000 / intervalMs).toFixed(2)} tickets/seg`);
  console.log(`  API           : ${API_URL}\n`);

  let successCount = 0;
  let errorCount   = 0;
  const startTime  = Date.now();

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];

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
        // Muestra progreso cada 50 tickets
        if ((i + 1) % 50 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          console.log(`\n  [${i + 1}/${TOTAL_TICKETS}] ${successCount} válidos — ${elapsed}s transcurridos`);
        }
      } else {
        errorCount++;
        const errData = await response.json().catch(() => ({}));
        console.error(`\n❌ Error ticket ${ticket.id}: ${JSON.stringify(errData)}`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`\n❌ Error de red (¿está corriendo el servidor en ${API_URL}?): `, error.message);

      // Interrumpe si hay 3 errores de red consecutivos para no bloquear la demo
      if (errorCount > 3) {
        console.error('\nInterrumpiendo: demasiados errores de red. Verificá que el servidor esté levantado.');
        break;
      }
    }

    if (i < tickets.length - 1) {
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
