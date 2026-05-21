import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { SignJWT } from 'jose';

// Bun auto-carga el archivo .env si lo ejecutamos desde el directorio backend

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function simulate() {
  console.log('--- Iniciando Simulación de Validación en Vivo ---');

  const event = await prisma.event.findFirst({
    where: { name: 'Tech Live Demo Expo 2026' }
  });

  if (!event) {
    console.error('No se encontró el evento "Tech Live Demo Expo 2026". Ejecuta el seed primero.');
    process.exit(1);
  }

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

  console.log(`Se encontraron ${tickets.length} tickets. Preparando simulación...`);

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
  
  // Utilizar "jose" tal como lo hace el backend internamente
  const secretKey = new TextEncoder().encode(jwtSecret);
  const issuer = process.env.JWT_ISSUER || 'veritix-api';

  const token = await new SignJWT({ email: validator.email, role: validator.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(validator.id)
    .setIssuedAt()
    .setIssuer(issuer)
    .setExpirationTime('1h')
    .sign(secretKey);

  const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
  const intervalMs = 600;
  
  console.log(`Inicio de validación. Intervalo: ${intervalMs}ms (aprox ${(1000/intervalMs).toFixed(2)} tickets/seg).`);
  
  let successCount = 0;
  let errorCount = 0;

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
      } else {
        errorCount++;
        const errData = await response.json().catch(() => ({}));
        console.error(`\n❌ Error al validar ticket ${ticket.id}: ${JSON.stringify(errData)}`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`\n❌ Error de red (¿está corriendo el servidor en ${API_URL}?): `, error.message);
      
      // Rompemos el ciclo si no hay servidor corriendo para no esperar 5 minutos de errores de red en la prueba
      if (errorCount > 3) {
          console.error('\nInterrumpiendo simulación debido a múltiples errores de red (El servidor no está levantado).');
          break;
      }
    }

    if (i < tickets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log('\n\n--- Simulación Completada ---');
  console.log(`Tickets validados con éxito: ${successCount}`);
  console.log(`Errores: ${errorCount}`);
}

simulate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
