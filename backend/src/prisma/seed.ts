import { PrismaPg } from '@prisma/adapter-pg';
import {
  ArtistRole,
  EventStatus,
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  Role,
  TicketStatus,
  VenueType,
} from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Genera un hash SHA-256 corto para el ticket (hex, 32 chars) */
function makeHash(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Genera un qrPayload cifrado simulado (AES-256-GCM).
 * En producción esto lo hace QrEncryptionService; aquí simulamos
 * el formato: iv:authTag:ciphertext en base64 separados por ':'
 */
function makeQrPayload(ticketId: string): string {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const payload = JSON.stringify({ ticketId, ts: Date.now() });
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ─── CATÁLOGOS ────────────────────────────────────────────────────────────────

const concertFormats = [
  {
    name: 'Concierto',
    slug: 'concierto',
    icon: '🎤',
    description: 'Show de uno o dos artistas, noche única',
  },
  {
    name: 'Festival',
    slug: 'festival',
    icon: '🎪',
    description: 'Múltiples artistas, puede ser multi-día',
  },
  {
    name: 'Tour',
    slug: 'tour',
    icon: '🚌',
    description: 'Fecha de una gira nacional o internacional',
  },
  {
    name: 'Tributo',
    slug: 'tributo',
    icon: '🎸',
    description: 'Banda tributo a un artista icónico',
  },
  {
    name: 'Acústico',
    slug: 'acustico',
    icon: '🪕',
    description: 'Formato íntimo sin amplificación electrónica',
  },
  {
    name: 'Club Night',
    slug: 'club-night',
    icon: '🎧',
    description: 'Show de DJ o música electrónica en club',
  },
  {
    name: 'Ciclo Flamenco',
    slug: 'ciclo-flamenco',
    icon: '💃',
    description: 'Serie de presentaciones de flamenco tradicional y fusión',
  },
];

const genres = [
  // Rock y derivados
  { name: 'Rock', slug: 'rock' },
  { name: 'Rock Alternativo', slug: 'rock-alternativo' },
  { name: 'Indie', slug: 'indie' },
  { name: 'Metal', slug: 'metal' },
  { name: 'Punk', slug: 'punk' },
  // Pop
  { name: 'Pop', slug: 'pop' },
  { name: 'Pop Latino', slug: 'pop-latino' },
  { name: 'K-Pop', slug: 'k-pop' },
  // Electrónica
  { name: 'Electrónica', slug: 'electronica' },
  { name: 'House', slug: 'house' },
  { name: 'Techno', slug: 'techno' },
  // Urban
  { name: 'Hip-Hop', slug: 'hip-hop' },
  { name: 'Trap', slug: 'trap' },
  { name: 'R&B', slug: 'r-and-b' },
  { name: 'Reggaeton', slug: 'reggaeton' },
  // Regional
  { name: 'Regional Mexicano', slug: 'regional-mexicano' },
  { name: 'Cumbia', slug: 'cumbia' },
  { name: 'Banda', slug: 'banda' },
  { name: 'Norteño', slug: 'norteno' },
  // Otros
  { name: 'Jazz', slug: 'jazz' },
  { name: 'Blues', slug: 'blues' },
  { name: 'Soul', slug: 'soul' },
  { name: 'Clásica', slug: 'clasica' },
  { name: 'Reggae', slug: 'reggae' },
  { name: 'Folk', slug: 'folk' },
  { name: 'Flamenco', slug: 'flamenco' },
  { name: 'Urbano Espanol', slug: 'urbano-espanol' },
];

const venues = [
  // Granada
  {
    name: 'Palacio de Congresos de Granada',
    slug: 'palacio-congresos-granada',
    address: 'Paseo del Violon s/n',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 2000,
    type: 'AUDITORIO' as const,
  },
  {
    name: 'Plaza de Toros de Granada',
    slug: 'plaza-toros-granada',
    address: 'Avenida del Doctor Oloriz 25',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 12000,
    type: 'AL_AIRE_LIBRE' as const,
  },
  {
    name: 'Industrial Copera',
    slug: 'industrial-copera',
    address: 'Calle Paris 18',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 4500,
    type: 'CLUB' as const,
  },
  {
    name: 'Teatro Isabel la Catolica',
    slug: 'teatro-isabel-la-catolica',
    address: 'Acera del Casino s/n',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 662,
    type: VenueType.TEATRO,
  },
  // Madrid
  {
    name: 'WiZink Center',
    slug: 'wizink-center',
    address: 'Avenida Felipe II s/n',
    city: 'Madrid',
    state: 'Comunidad de Madrid',
    country: 'ES',
    capacity: 17000,
    type: VenueType.ARENA,
  },
  // Barcelona
  {
    name: 'Palau Sant Jordi',
    slug: 'palau-sant-jordi',
    address: 'Passeig Olimpic 5-7',
    city: 'Barcelona',
    state: 'Cataluna',
    country: 'ES',
    capacity: 18000,
    type: VenueType.ARENA,
  },
  // Sevilla — nuevo
  {
    name: 'FIBES Palacio de Congresos y Exposiciones de Sevilla',
    slug: 'fibes-sevilla',
    address: 'Avenida de Adolfo Suarez s/n',
    city: 'Sevilla',
    state: 'Andalucia',
    country: 'ES',
    capacity: 5000,
    type: VenueType.AUDITORIO,
  },
  // Bilbao — nuevo
  {
    name: 'BEC Bilbao Exhibition Centre',
    slug: 'bec-bilbao',
    address: 'Ronda de Azkue 1',
    city: 'Bilbao',
    state: 'Pais Vasco',
    country: 'ES',
    capacity: 14000,
    type: VenueType.ARENA,
  },
];

// 5 artistas originales + 10 nuevos = 15 total
const artists = [
  // ── Originales ──
  {
    name: 'Lori Meyers',
    slug: 'lori-meyers',
    country: 'ES',
    bio: 'Banda indie rock granadina.',
    genres: ['indie', 'rock-alternativo'],
  },
  {
    name: 'Los Planetas',
    slug: 'los-planetas',
    country: 'ES',
    bio: 'Referente del indie rock en Espana, originarios de Granada.',
    genres: ['indie', 'rock'],
  },
  {
    name: 'Dellafuente',
    slug: 'dellafuente',
    country: 'ES',
    bio: 'Artista urbano granadino que fusiona trap, flamenco y hip-hop.',
    genres: ['trap', 'hip-hop'],
  },
  {
    name: 'Vetusta Morla',
    slug: 'vetusta-morla',
    country: 'ES',
    bio: 'Banda madrilena de rock alternativo.',
    genres: ['rock-alternativo', 'indie'],
  },
  {
    name: 'Rosalia',
    slug: 'rosalia',
    country: 'ES',
    bio: 'Artista espanola que fusiona flamenco, pop y urbano.',
    genres: ['flamenco', 'pop', 'urbano-espanol'],
  },
  // ── Nuevos ──
  {
    name: 'C. Tangana',
    slug: 'c-tangana',
    country: 'ES',
    bio: 'Artista madrileno que mezcla urbano, flamenco, copla y bolero.',
    genres: ['urbano-espanol', 'pop', 'flamenco'],
  },
  {
    name: 'Bad Gyal',
    slug: 'bad-gyal',
    country: 'ES',
    bio: 'Artista barcelonesa de reggaeton y dancehall con influencias del R&B.',
    genres: ['reggaeton', 'r-and-b'],
  },
  {
    name: 'Izal',
    slug: 'izal',
    country: 'ES',
    bio: 'Banda de rock alternativo madrilena con marcado estilo poetico.',
    genres: ['rock-alternativo', 'indie'],
  },
  {
    name: 'Anni B Sweet',
    slug: 'anni-b-sweet',
    country: 'ES',
    bio: 'Cantautora indie pop espanola con influencias del folk y el jazz.',
    genres: ['indie', 'folk', 'pop'],
  },
  {
    name: 'El Kanka',
    slug: 'el-kanka',
    country: 'ES',
    bio: 'Cantautor malageno de folk y pop con letras ironica y cotidianas.',
    genres: ['folk', 'pop'],
  },
  {
    name: 'Morat',
    slug: 'morat',
    country: 'CO',
    bio: 'Banda colombiana de pop alternativo con gran popularidad en Espana.',
    genres: ['pop', 'pop-latino'],
  },
  {
    name: 'Nathy Peluso',
    slug: 'nathy-peluso',
    country: 'AR',
    bio: 'Artista argentino-espanola que fusiona jazz, funk, hip-hop y urbano.',
    genres: ['hip-hop', 'r-and-b', 'soul'],
  },
  {
    name: 'Stromae',
    slug: 'stromae',
    country: 'BE',
    bio: 'Artista belga que mezcla electropop, dance y chanson con letras profundas.',
    genres: ['electronica', 'pop'],
  },
  {
    name: 'Ojete Calor',
    slug: 'ojete-calor',
    country: 'ES',
    bio: 'Duo humoristico-musical espanol de pop kitsch y electronica festiva.',
    genres: ['pop', 'electronica'],
  },
  {
    name: 'Fito y Fitipaldis',
    slug: 'fito-y-fitipaldis',
    country: 'ES',
    bio: 'Banda vasca de rock con influencias del blues y el pop.',
    genres: ['rock', 'blues'],
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── Usuarios ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(`${process.env.ADMIN_PASSWORD}`, 12);
  const userPassword = await bcrypt.hash(`${process.env.USER_PASSWORD}`, 12);
  const defaultBuyerPassword = await bcrypt.hash('Buyer1234!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@veritix.app' },
    update: {},
    create: {
      email: 'admin@veritix.app',
      phone: '+34958000001',
      name: 'Admin',
      lastName: 'VeriTix',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@veritix.app' },
    update: {},
    create: {
      email: 'user@veritix.app',
      phone: '+34958000002',
      name: 'User',
      lastName: 'VeriTix',
      password: userPassword,
      role: Role.BUYER,
      isActive: true,
      emailVerified: true,
    },
  });

  // Creator de prueba — nuevo
  await prisma.user.upsert({
    where: { email: 'creator@veritix.app' },
    update: {},
    create: {
      email: 'creator@veritix.app',
      phone: '+34958000003',
      name: 'Creator',
      lastName: 'Demo',
      password: userPassword,
      role: Role.CREATOR,
      isActive: true,
      emailVerified: true,
    },
  });

  // Validator de prueba — para RF-20 SSE y escaneo de QR
  await prisma.user.upsert({
    where: { email: 'validator@veritix.app' },
    update: {},
    create: {
      email: 'validator@veritix.app',
      phone: '+34958000004',
      name: 'Validator',
      lastName: 'Demo',
      password: userPassword,
      role: Role.VALIDATOR,
      isActive: true,
      emailVerified: true,
    },
  });

  // Buyers adicionales para poblar órdenes de eventos FINISHED
  const extraBuyers = [
    {
      email: 'buyer1@veritix.app',
      phone: '+34958000010',
      name: 'Ana',
      lastName: 'García',
    },
    {
      email: 'buyer2@veritix.app',
      phone: '+34958000011',
      name: 'Carlos',
      lastName: 'Martínez',
    },
    {
      email: 'buyer3@veritix.app',
      phone: '+34958000012',
      name: 'Sofía',
      lastName: 'López',
    },
    {
      email: 'buyer4@veritix.app',
      phone: '+34958000013',
      name: 'Miguel',
      lastName: 'Fernández',
    },
  ];

  for (const buyer of extraBuyers) {
    await prisma.user.upsert({
      where: { email: buyer.email },
      update: {},
      create: {
        ...buyer,
        password: defaultBuyerPassword,
        role: Role.BUYER,
        isActive: true,
        emailVerified: true,
      },
    });
  }

  // ── Catálogos ─────────────────────────────────────────────────────────────
  for (const format of concertFormats) {
    await prisma.concertFormat.upsert({
      where: { slug: format.slug },
      update: {},
      create: format,
    });
  }

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {},
      create: venue,
    });
  }

  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { slug: artist.slug },
      update: {
        name: artist.name,
        country: artist.country,
        bio: artist.bio,
        genres: {
          set: [],
          connect: artist.genres.map((slug) => ({ slug })),
        },
      },
      create: {
        name: artist.name,
        slug: artist.slug,
        country: artist.country,
        bio: artist.bio,
        genres: {
          connect: artist.genres.map((slug) => ({ slug })),
        },
      },
    });
  }

  // ── Resolver referencias ──────────────────────────────────────────────────
  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'admin@veritix.app' },
  });
  const creatorUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'creator@veritix.app' },
  });
  const validatorUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'validator@veritix.app' },
  });
  const buyerUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'user@veritix.app' },
  });
  const buyer1 = await prisma.user.findUniqueOrThrow({
    where: { email: 'buyer1@veritix.app' },
  });
  const buyer2 = await prisma.user.findUniqueOrThrow({
    where: { email: 'buyer2@veritix.app' },
  });
  const buyer3 = await prisma.user.findUniqueOrThrow({
    where: { email: 'buyer3@veritix.app' },
  });
  const buyer4 = await prisma.user.findUniqueOrThrow({
    where: { email: 'buyer4@veritix.app' },
  });

  // Formats
  const fmtConcierto = await prisma.concertFormat.findUniqueOrThrow({ where: { slug: 'concierto' } });
  const fmtFestival = await prisma.concertFormat.findUniqueOrThrow({ where: { slug: 'festival' } });
  const fmtTour = await prisma.concertFormat.findUniqueOrThrow({ where: { slug: 'tour' } });
  const fmtAcustico = await prisma.concertFormat.findUniqueOrThrow({ where: { slug: 'acustico' } });
  const fmtClubNight = await prisma.concertFormat.findUniqueOrThrow({ where: { slug: 'club-night' } });
  const fmtTributo = await prisma.concertFormat.findUniqueOrThrow({ where: { slug: 'tributo' } });

  // Venues
  const palacioCongresos = await prisma.venue.findUniqueOrThrow({ where: { slug: 'palacio-congresos-granada' } });
  const plazaToros = await prisma.venue.findUniqueOrThrow({ where: { slug: 'plaza-toros-granada' } });
  const copera = await prisma.venue.findUniqueOrThrow({ where: { slug: 'industrial-copera' } });
  const teatroIsabel = await prisma.venue.findUniqueOrThrow({ where: { slug: 'teatro-isabel-la-catolica' } });
  const wizink = await prisma.venue.findUniqueOrThrow({ where: { slug: 'wizink-center' } });
  const palauSantJordi = await prisma.venue.findUniqueOrThrow({ where: { slug: 'palau-sant-jordi' } });
  const fibesSevilla = await prisma.venue.findUniqueOrThrow({ where: { slug: 'fibes-sevilla' } });
  const becBilbao = await prisma.venue.findUniqueOrThrow({ where: { slug: 'bec-bilbao' } });

  // Artists
  const losPlanetas = await prisma.artist.findUniqueOrThrow({ where: { slug: 'los-planetas' } });
  const loriMeyers = await prisma.artist.findUniqueOrThrow({ where: { slug: 'lori-meyers' } });
  const dellafuente = await prisma.artist.findUniqueOrThrow({ where: { slug: 'dellafuente' } });
  const vetustaMorla = await prisma.artist.findUniqueOrThrow({ where: { slug: 'vetusta-morla' } });
  const rosalia = await prisma.artist.findUniqueOrThrow({ where: { slug: 'rosalia' } });
  const cTangana = await prisma.artist.findUniqueOrThrow({ where: { slug: 'c-tangana' } });
  const badGyal = await prisma.artist.findUniqueOrThrow({ where: { slug: 'bad-gyal' } });
  const izal = await prisma.artist.findUniqueOrThrow({ where: { slug: 'izal' } });
  const anniBSweet = await prisma.artist.findUniqueOrThrow({ where: { slug: 'anni-b-sweet' } });
  const elKanka = await prisma.artist.findUniqueOrThrow({ where: { slug: 'el-kanka' } });
  const morat = await prisma.artist.findUniqueOrThrow({ where: { slug: 'morat' } });
  const nathyPeluso = await prisma.artist.findUniqueOrThrow({ where: { slug: 'nathy-peluso' } });
  const stromae = await prisma.artist.findUniqueOrThrow({ where: { slug: 'stromae' } });
  const fitoYFitipaldis = await prisma.artist.findUniqueOrThrow({ where: { slug: 'fito-y-fitipaldis' } });

  // Genres
  const gIndie = await prisma.genre.findUniqueOrThrow({ where: { slug: 'indie' } });
  const gRock = await prisma.genre.findUniqueOrThrow({ where: { slug: 'rock' } });
  const gRockAlt = await prisma.genre.findUniqueOrThrow({ where: { slug: 'rock-alternativo' } });
  const gPop = await prisma.genre.findUniqueOrThrow({ where: { slug: 'pop' } });
  const gPopLatino = await prisma.genre.findUniqueOrThrow({ where: { slug: 'pop-latino' } });
  const gElectronica = await prisma.genre.findUniqueOrThrow({ where: { slug: 'electronica' } });
  const gTrap = await prisma.genre.findUniqueOrThrow({ where: { slug: 'trap' } });
  const gHipHop = await prisma.genre.findUniqueOrThrow({ where: { slug: 'hip-hop' } });
  const gFlamenco = await prisma.genre.findUniqueOrThrow({ where: { slug: 'flamenco' } });
  const gReggaeton = await prisma.genre.findUniqueOrThrow({ where: { slug: 'reggaeton' } });
  const gFolk = await prisma.genre.findUniqueOrThrow({ where: { slug: 'folk' } });
  const gJazz = await prisma.genre.findUniqueOrThrow({ where: { slug: 'jazz' } });
  const gSoul = await prisma.genre.findUniqueOrThrow({ where: { slug: 'soul' } });
  const gBlues = await prisma.genre.findUniqueOrThrow({ where: { slug: 'blues' } });
  const gUrbanoEs = await prisma.genre.findUniqueOrThrow({ where: { slug: 'urbano-espanol' } });

  // ── Cleanup idempotente ───────────────────────────────────────────────────
  const demoEventNames = [
    // 4 originales
    'Granada Indie Night 2026',
    'Granada Urban Sessions 2026',
    'Madrid Pop Arena 2026',
    'Barcelona Electronica Nights 2026',
    // 16 nuevos
    'Bilbao Rock Fest 2026',
    'Sevilla Flamenco Fusion 2026',
    'Granada Acustico Sessions 2026',
    'Madrid Urban Tour 2026',
    'Barcelona Pop Night 2026',
    'Bilbao Club Night Edition 2026',
    'Sevilla Folk & Soul 2026',
    'Madrid Jazz Club 2027',
    'Granada Festival de Verano 2027',
    'Barcelona Tributo a los 90s 2026',
    'Madrid Reggaeton Arena 2026',
    'Sevilla Indie Pop Weekend 2026',
    // 4 DRAFT
    'Granada Draft Rock Night',
    'Madrid Draft Pop Showcase',
    'Bilbao Draft Electronic Session',
    'Sevilla Draft Flamenco Night',
    // 2 FINISHED (pasados, 2025)
    'Granada Indie Night 2025',
    'Madrid Rock Fest 2025',
    // 2 CANCELLED
    'Valencia Pop Fest 2026 (Cancelado)',
    'Barcelona Metal Night 2026 (Cancelado)',
  ];

  const existingDemoEvents = await prisma.event.findMany({
    where: { name: { in: demoEventNames } },
    select: { id: true },
  });

  const existingEventIds = existingDemoEvents.map((e) => e.id);

  if (existingEventIds.length > 0) {
    const existingOrders = await prisma.order.findMany({
      where: { eventId: { in: existingEventIds } },
      select: { id: true },
    });
    const existingOrderIds = existingOrders.map((o) => o.id);

    if (existingOrderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: existingOrderIds } } });
      await prisma.ticket.deleteMany({ where: { orderId: { in: existingOrderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: existingOrderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: existingOrderIds } } });
    }

    await prisma.event.deleteMany({ where: { id: { in: existingEventIds } } });
  }

  // ── EVENTOS PUBLISHED (12) ────────────────────────────────────────────────

  // 1 — Granada Indie Night 2026 (original, admin)
  const indieNight = await prisma.event.create({
    data: {
      name: 'Granada Indie Night 2026',
      description: 'Noche indie con artistas emblematicos de Granada.',
      eventDate: new Date('2026-09-19T21:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-09-19T19:30:00.000+02:00'),
      startSale: new Date('2026-05-01T10:00:00.000+02:00'),
      endSale: new Date('2026-09-19T18:00:00.000+02:00'),
      maxCapacity: 2000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/granada-indie-night-2026/800/450',
      creatorId: adminUser.id,
      venueId: palacioCongresos.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gIndie.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: losPlanetas.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: loriMeyers.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'General', description: 'Acceso general', price: '38.00', totalQuantity: 1200, availableQuantity: 1200, maxPerUser: 6, eventId: indieNight.id, saleStartDate: new Date('2026-05-01T10:00:00.000+02:00'), saleEndDate: new Date('2026-09-19T18:00:00.000+02:00') },
      { name: 'Preferente', description: 'Zona preferente frente al escenario', price: '65.00', totalQuantity: 500, availableQuantity: 500, maxPerUser: 4, eventId: indieNight.id, saleStartDate: new Date('2026-05-01T10:00:00.000+02:00'), saleEndDate: new Date('2026-09-19T18:00:00.000+02:00') },
    ],
  });

  // 2 — Granada Urban Sessions 2026 (original, admin)
  const urbanFest = await prisma.event.create({
    data: {
      name: 'Granada Urban Sessions 2026',
      description: 'Encuentro urbano en formato al aire libre.',
      eventDate: new Date('2026-10-03T22:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-10-03T20:00:00.000+02:00'),
      startSale: new Date('2026-06-10T10:00:00.000+02:00'),
      endSale: new Date('2026-10-03T20:30:00.000+02:00'),
      maxCapacity: 12000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/granada-urban-sessions-2026/800/450',
      creatorId: adminUser.id,
      venueId: plazaToros.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gTrap.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: dellafuente.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Pista', description: 'Acceso pista general', price: '45.00', totalQuantity: 7000, availableQuantity: 7000, maxPerUser: 6, eventId: urbanFest.id, saleStartDate: new Date('2026-06-10T10:00:00.000+02:00'), saleEndDate: new Date('2026-10-03T20:30:00.000+02:00') },
      { name: 'Front Stage', description: 'Zona premium cercana al escenario', price: '85.00', totalQuantity: 1500, availableQuantity: 1500, maxPerUser: 4, eventId: urbanFest.id, saleStartDate: new Date('2026-06-10T10:00:00.000+02:00'), saleEndDate: new Date('2026-10-03T20:30:00.000+02:00') },
    ],
  });

  // 3 — Madrid Pop Arena 2026 (original, admin)
  const madridPop = await prisma.event.create({
    data: {
      name: 'Madrid Pop Arena 2026',
      description: 'Show pop con produccion audiovisual a gran escala.',
      eventDate: new Date('2026-11-14T21:30:00.000+01:00'),
      doorsOpenTime: new Date('2026-11-14T19:30:00.000+01:00'),
      startSale: new Date('2026-06-20T10:00:00.000+02:00'),
      endSale: new Date('2026-11-14T20:30:00.000+01:00'),
      maxCapacity: 17000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/madrid-pop-arena-2026/800/450',
      creatorId: adminUser.id,
      venueId: wizink.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gPop.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: rosalia.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: vetustaMorla.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'General', description: 'Acceso general grada', price: '55.00', totalQuantity: 9000, availableQuantity: 9000, maxPerUser: 6, eventId: madridPop.id, saleStartDate: new Date('2026-06-20T10:00:00.000+02:00'), saleEndDate: new Date('2026-11-14T20:30:00.000+01:00') },
      { name: 'Premium', description: 'Zona premium con visibilidad preferente', price: '120.00', totalQuantity: 2200, availableQuantity: 2200, maxPerUser: 4, eventId: madridPop.id, saleStartDate: new Date('2026-06-20T10:00:00.000+02:00'), saleEndDate: new Date('2026-11-14T20:30:00.000+01:00') },
    ],
  });

  // 4 — Barcelona Electronica Nights 2026 (original, admin)
  const barcelonaElectronic = await prisma.event.create({
    data: {
      name: 'Barcelona Electronica Nights 2026',
      description: 'Noche de musica electronica con visuales inmersivos.',
      eventDate: new Date('2026-12-05T22:30:00.000+01:00'),
      doorsOpenTime: new Date('2026-12-05T20:30:00.000+01:00'),
      startSale: new Date('2026-07-01T10:00:00.000+02:00'),
      endSale: new Date('2026-12-05T21:30:00.000+01:00'),
      maxCapacity: 18000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/barcelona-electronica-nights-2026/800/450',
      creatorId: adminUser.id,
      venueId: palauSantJordi.id,
      formatId: fmtClubNight.id,
      genres: { connect: [{ id: gElectronica.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: stromae.id },
          { role: ArtistRole.OPENER, performanceOrder: 2, artistId: dellafuente.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Pista', description: 'Pista general', price: '60.00', totalQuantity: 10000, availableQuantity: 10000, maxPerUser: 6, eventId: barcelonaElectronic.id, saleStartDate: new Date('2026-07-01T10:00:00.000+02:00'), saleEndDate: new Date('2026-12-05T21:30:00.000+01:00') },
      { name: 'VIP Experience', description: 'Acceso VIP con beneficios exclusivos', price: '140.00', totalQuantity: 1800, availableQuantity: 1800, maxPerUser: 4, eventId: barcelonaElectronic.id, saleStartDate: new Date('2026-07-01T10:00:00.000+02:00'), saleEndDate: new Date('2026-12-05T21:30:00.000+01:00') },
    ],
  });

  // 5 — Bilbao Rock Fest 2026 (creator)
  const bilbaoRock = await prisma.event.create({
    data: {
      name: 'Bilbao Rock Fest 2026',
      description: 'Festival de rock con las mejores bandas nacionales en el BEC.',
      eventDate: new Date('2026-08-22T19:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-08-22T17:00:00.000+02:00'),
      startSale: new Date('2026-04-01T10:00:00.000+02:00'),
      endSale: new Date('2026-08-22T17:00:00.000+02:00'),
      maxCapacity: 14000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/bilbao-rock-fest-2026/800/450',
      creatorId: creatorUser.id,
      venueId: becBilbao.id,
      formatId: fmtFestival.id,
      genres: { connect: [{ id: gRock.id }, { id: gRockAlt.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: izal.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: vetustaMorla.id },
          { role: ArtistRole.OPENER, performanceOrder: 3, artistId: fitoYFitipaldis.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Acceso General', description: 'Pista general todo el festival', price: '49.00', totalQuantity: 8000, availableQuantity: 8000, maxPerUser: 6, eventId: bilbaoRock.id },
      { name: 'VIP', description: 'Zona VIP con barra libre y zona reservada', price: '110.00', totalQuantity: 1500, availableQuantity: 1500, maxPerUser: 4, eventId: bilbaoRock.id },
    ],
  });

  // 6 — Sevilla Flamenco Fusion 2026 (creator)
  const sevillaFlamenco = await prisma.event.create({
    data: {
      name: 'Sevilla Flamenco Fusion 2026',
      description: 'Noche de flamenco fusion con artistas que mezclan tradicion y modernidad.',
      eventDate: new Date('2026-07-18T21:30:00.000+02:00'),
      doorsOpenTime: new Date('2026-07-18T20:00:00.000+02:00'),
      startSale: new Date('2026-03-15T10:00:00.000+01:00'),
      endSale: new Date('2026-07-18T20:00:00.000+02:00'),
      maxCapacity: 5000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/sevilla-flamenco-fusion-2026/800/450',
      creatorId: creatorUser.id,
      venueId: fibesSevilla.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gFlamenco.id }, { id: gUrbanoEs.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: cTangana.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: rosalia.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'General', description: 'Acceso general', price: '42.00', totalQuantity: 3000, availableQuantity: 3000, maxPerUser: 6, eventId: sevillaFlamenco.id },
      { name: 'Patio de Butacas', description: 'Zona de butacas numeradas', price: '75.00', totalQuantity: 800, availableQuantity: 800, maxPerUser: 4, eventId: sevillaFlamenco.id },
    ],
  });

  // 7 — Granada Acustico Sessions 2026 (admin)
  const granadaAcustico = await prisma.event.create({
    data: {
      name: 'Granada Acustico Sessions 2026',
      description: 'Sesiones intimas con cantautores en el historico Teatro Isabel la Católica.',
      eventDate: new Date('2026-11-28T20:00:00.000+01:00'),
      doorsOpenTime: new Date('2026-11-28T19:00:00.000+01:00'),
      startSale: new Date('2026-09-01T10:00:00.000+02:00'),
      endSale: new Date('2026-11-28T18:00:00.000+01:00'),
      maxCapacity: 662,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/granada-acustico-sessions-2026/800/450',
      creatorId: adminUser.id,
      venueId: teatroIsabel.id,
      formatId: fmtAcustico.id,
      genres: { connect: [{ id: gFolk.id }, { id: gIndie.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: anniBSweet.id },
          { role: ArtistRole.OPENER, performanceOrder: 2, artistId: elKanka.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Butaca', description: 'Butaca numerada', price: '28.00', totalQuantity: 500, availableQuantity: 500, maxPerUser: 4, eventId: granadaAcustico.id },
      { name: 'Platea VIP', description: 'Platea preferente con visibilidad completa', price: '55.00', totalQuantity: 100, availableQuantity: 100, maxPerUser: 2, eventId: granadaAcustico.id },
    ],
  });

  // 8 — Madrid Urban Tour 2026 (admin)
  const madridUrban = await prisma.event.create({
    data: {
      name: 'Madrid Urban Tour 2026',
      description: 'Fecha de la gira nacional con lo mejor del urbano espanol.',
      eventDate: new Date('2026-10-24T21:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-10-24T19:30:00.000+02:00'),
      startSale: new Date('2026-05-15T10:00:00.000+02:00'),
      endSale: new Date('2026-10-24T20:00:00.000+02:00'),
      maxCapacity: 17000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/madrid-urban-tour-2026/800/450',
      creatorId: adminUser.id,
      venueId: wizink.id,
      formatId: fmtTour.id,
      genres: { connect: [{ id: gUrbanoEs.id }, { id: gTrap.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: cTangana.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: dellafuente.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Pista', description: 'Pista general', price: '50.00', totalQuantity: 10000, availableQuantity: 10000, maxPerUser: 6, eventId: madridUrban.id },
      { name: 'Grada Numerada', description: 'Asiento numerado en grada', price: '65.00', totalQuantity: 4000, availableQuantity: 4000, maxPerUser: 4, eventId: madridUrban.id },
    ],
  });

  // 9 — Barcelona Pop Night 2026 (creator)
  const barcelonaPop = await prisma.event.create({
    data: {
      name: 'Barcelona Pop Night 2026',
      description: 'Una noche de pop latino e internacional en el Palau Sant Jordi.',
      eventDate: new Date('2026-09-05T21:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-09-05T19:30:00.000+02:00'),
      startSale: new Date('2026-04-20T10:00:00.000+02:00'),
      endSale: new Date('2026-09-05T20:00:00.000+02:00'),
      maxCapacity: 18000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/barcelona-pop-night-2026/800/450',
      creatorId: creatorUser.id,
      venueId: palauSantJordi.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gPop.id }, { id: gPopLatino.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: morat.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: badGyal.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'General', description: 'Pista general', price: '52.00', totalQuantity: 11000, availableQuantity: 11000, maxPerUser: 6, eventId: barcelonaPop.id },
      { name: 'Premium', description: 'Zona premium', price: '95.00', totalQuantity: 2500, availableQuantity: 2500, maxPerUser: 4, eventId: barcelonaPop.id },
    ],
  });

  // 10 — Bilbao Club Night Edition 2026 (creator)
  const bilbaoClub = await prisma.event.create({
    data: {
      name: 'Bilbao Club Night Edition 2026',
      description: 'Noche de musica electronica y house en el BEC convertido en club.',
      eventDate: new Date('2026-11-07T23:00:00.000+01:00'),
      doorsOpenTime: new Date('2026-11-07T22:00:00.000+01:00'),
      startSale: new Date('2026-07-10T10:00:00.000+02:00'),
      endSale: new Date('2026-11-07T22:00:00.000+01:00'),
      maxCapacity: 5000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/bilbao-club-night-2026/800/450',
      creatorId: creatorUser.id,
      venueId: becBilbao.id,
      formatId: fmtClubNight.id,
      genres: { connect: [{ id: gElectronica.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: stromae.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Early Bird', description: 'Entrada anticipada', price: '25.00', totalQuantity: 1000, availableQuantity: 1000, maxPerUser: 4, eventId: bilbaoClub.id },
      { name: 'General', description: 'Entrada general', price: '35.00', totalQuantity: 3000, availableQuantity: 3000, maxPerUser: 6, eventId: bilbaoClub.id },
    ],
  });

  // 11 — Sevilla Folk & Soul 2026 (admin)
  const sevillaFolk = await prisma.event.create({
    data: {
      name: 'Sevilla Folk & Soul 2026',
      description: 'Una tarde de folk, soul y jazz en el corazon de Sevilla.',
      eventDate: new Date('2026-10-17T19:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-10-17T18:00:00.000+02:00'),
      startSale: new Date('2026-06-01T10:00:00.000+02:00'),
      endSale: new Date('2026-10-17T18:00:00.000+02:00'),
      maxCapacity: 5000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/sevilla-folk-soul-2026/800/450',
      creatorId: adminUser.id,
      venueId: fibesSevilla.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gFolk.id }, { id: gSoul.id }, { id: gJazz.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: nathyPeluso.id },
          { role: ArtistRole.OPENER, performanceOrder: 2, artistId: elKanka.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'General', description: 'Acceso general', price: '35.00', totalQuantity: 3500, availableQuantity: 3500, maxPerUser: 6, eventId: sevillaFolk.id },
      { name: 'Preferente', description: 'Zona preferente', price: '60.00', totalQuantity: 800, availableQuantity: 800, maxPerUser: 4, eventId: sevillaFolk.id },
    ],
  });

  // 12 — Granada Festival de Verano 2027 (creator)
  const granadaFestival = await prisma.event.create({
    data: {
      name: 'Granada Festival de Verano 2027',
      description: 'El festival de verano mas esperado de Granada vuelve mas grande que nunca.',
      eventDate: new Date('2027-07-10T18:00:00.000+02:00'),
      doorsOpenTime: new Date('2027-07-10T16:00:00.000+02:00'),
      startSale: new Date('2026-12-01T10:00:00.000+01:00'),
      endSale: new Date('2027-07-10T16:00:00.000+02:00'),
      maxCapacity: 12000,
      status: EventStatus.PUBLISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/granada-festival-verano-2027/800/450',
      creatorId: creatorUser.id,
      venueId: plazaToros.id,
      formatId: fmtFestival.id,
      genres: { connect: [{ id: gIndie.id }, { id: gRockAlt.id }, { id: gPop.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: vetustaMorla.id },
          { role: ArtistRole.HEADLINER, performanceOrder: 2, artistId: izal.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 3, artistId: anniBSweet.id },
          { role: ArtistRole.OPENER, performanceOrder: 4, artistId: loriMeyers.id },
        ],
      },
    },
  });
  await prisma.ticketType.createMany({
    data: [
      { name: 'Abono General', description: 'Acceso a todos los escenarios', price: '70.00', totalQuantity: 8000, availableQuantity: 8000, maxPerUser: 6, eventId: granadaFestival.id },
      { name: 'Abono VIP', description: 'Zona VIP con servicios exclusivos', price: '150.00', totalQuantity: 1200, availableQuantity: 1200, maxPerUser: 4, eventId: granadaFestival.id },
    ],
  });

  // ── EVENTOS DRAFT (4) — alimentan requires-attention ─────────────────────

  // DRAFT 1 — Sin imagen, sin artistas (admin)
  await prisma.event.create({
    data: {
      name: 'Granada Draft Rock Night',
      description: 'Concierto de rock en preparacion.',
      eventDate: new Date('2026-12-20T21:00:00.000+01:00'),
      maxCapacity: 2000,
      status: EventStatus.DRAFT,
      currency: 'EUR',
      // Sin imageUrl — issue: Sin imagen
      // Sin artistas — issue: Sin artistas
      creatorId: adminUser.id,
      venueId: palacioCongresos.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gRock.id }] },
    },
  });

  // DRAFT 2 — Sin ticket types (creator)
  const draftMadrid = await prisma.event.create({
    data: {
      name: 'Madrid Draft Pop Showcase',
      description: 'Showcase de pop en Madrid, pendiente de confirmar entradas.',
      eventDate: new Date('2027-02-14T20:00:00.000+01:00'),
      maxCapacity: 4000,
      status: EventStatus.DRAFT,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/madrid-draft-pop/800/450',
      // Sin ticket types — issue: Sin tipos de entrada
      creatorId: creatorUser.id,
      venueId: copera.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gPop.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: morat.id },
        ],
      },
    },
  });
  void draftMadrid; // sin ticketTypes

  // DRAFT 3 — Sin formato, sin imagen (creator)
  await prisma.event.create({
    data: {
      name: 'Bilbao Draft Electronic Session',
      description: 'Sesion electronica en Bilbao, pendiente de definir formato.',
      eventDate: new Date('2027-03-08T23:00:00.000+01:00'),
      maxCapacity: 3000,
      status: EventStatus.DRAFT,
      currency: 'EUR',
      // Sin imageUrl — issue: Sin imagen
      // Sin formatId — issue: Sin formato
      creatorId: creatorUser.id,
      venueId: becBilbao.id,
      genres: { connect: [{ id: gElectronica.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: stromae.id },
        ],
      },
    },
  });

  // DRAFT 4 — Sin artistas, sin ticket types, sin imagen (admin)
  await prisma.event.create({
    data: {
      name: 'Sevilla Draft Flamenco Night',
      description: 'Noche de flamenco en Sevilla, en proceso de produccion.',
      eventDate: new Date('2027-04-05T21:00:00.000+02:00'),
      maxCapacity: 1500,
      status: EventStatus.DRAFT,
      currency: 'EUR',
      // Sin imageUrl, sin artistas, sin ticket types — 3 issues
      creatorId: adminUser.id,
      venueId: fibesSevilla.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gFlamenco.id }] },
    },
  });

  // ── EVENTOS FINISHED (2) — con órdenes y pagos para analytics ────────────

  // FINISHED 1 — Granada Indie Night 2025 (evento pasado más vendido)
  const finishedIndie = await prisma.event.create({
    data: {
      name: 'Granada Indie Night 2025',
      description: 'La edicion 2025 de la noche indie de Granada, un exito rotundo.',
      eventDate: new Date('2025-09-20T21:00:00.000+02:00'),
      doorsOpenTime: new Date('2025-09-20T19:30:00.000+02:00'),
      startSale: new Date('2025-05-01T10:00:00.000+02:00'),
      endSale: new Date('2025-09-20T18:00:00.000+02:00'),
      maxCapacity: 2000,
      status: EventStatus.FINISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/granada-indie-night-2025/800/450',
      creatorId: adminUser.id,
      venueId: palacioCongresos.id,
      formatId: fmtConcierto.id,
      genres: { connect: [{ id: gIndie.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: losPlanetas.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 2, artistId: loriMeyers.id },
        ],
      },
    },
  });
  const fi1General = await prisma.ticketType.create({
    data: { name: 'General', description: 'Acceso general', price: '35.00', totalQuantity: 1200, availableQuantity: 0, maxPerUser: 6, eventId: finishedIndie.id },
  });
  const fi1Preferente = await prisma.ticketType.create({
    data: { name: 'Preferente', description: 'Zona preferente', price: '60.00', totalQuantity: 500, availableQuantity: 0, maxPerUser: 4, eventId: finishedIndie.id },
  });

  // FINISHED 2 — Madrid Rock Fest 2025
  const finishedRock = await prisma.event.create({
    data: {
      name: 'Madrid Rock Fest 2025',
      description: 'Festival de rock que congrego a miles de fans en el WiZink Center.',
      eventDate: new Date('2025-11-15T20:00:00.000+01:00'),
      doorsOpenTime: new Date('2025-11-15T18:00:00.000+01:00'),
      startSale: new Date('2025-06-01T10:00:00.000+02:00'),
      endSale: new Date('2025-11-15T19:00:00.000+01:00'),
      maxCapacity: 17000,
      status: EventStatus.FINISHED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/madrid-rock-fest-2025/800/450',
      creatorId: creatorUser.id,
      venueId: wizink.id,
      formatId: fmtFestival.id,
      genres: { connect: [{ id: gRock.id }, { id: gRockAlt.id }] },
      artists: {
        create: [
          { role: ArtistRole.HEADLINER, performanceOrder: 1, artistId: izal.id },
          { role: ArtistRole.HEADLINER, performanceOrder: 2, artistId: fitoYFitipaldis.id },
          { role: ArtistRole.SPECIAL_GUEST, performanceOrder: 3, artistId: vetustaMorla.id },
        ],
      },
    },
  });
  const fr1General = await prisma.ticketType.create({
    data: { name: 'General', description: 'Pista general', price: '55.00', totalQuantity: 10000, availableQuantity: 0, maxPerUser: 6, eventId: finishedRock.id },
  });
  const fr1Premium = await prisma.ticketType.create({
    data: { name: 'Premium', description: 'Zona premium', price: '110.00', totalQuantity: 3000, availableQuantity: 0, maxPerUser: 4, eventId: finishedRock.id },
  });

  // ── EVENTOS CANCELLED (2) ─────────────────────────────────────────────────

  await prisma.event.create({
    data: {
      name: 'Valencia Pop Fest 2026 (Cancelado)',
      description: 'Festival cancelado por problemas de produccion.',
      eventDate: new Date('2026-08-15T18:00:00.000+02:00'),
      maxCapacity: 8000,
      status: EventStatus.CANCELLED,
      currency: 'EUR',
      imageUrl: 'https://picsum.photos/seed/valencia-pop-fest-2026/800/450',
      creatorId: adminUser.id,
      venueId: wizink.id,
      formatId: fmtFestival.id,
      genres: { connect: [{ id: gPop.id }] },
    },
  });

  await prisma.event.create({
    data: {
      name: 'Barcelona Metal Night 2026 (Cancelado)',
      description: 'Concierto cancelado por baja venta de entradas.',
      eventDate: new Date('2026-06-20T21:00:00.000+02:00'),
      maxCapacity: 3000,
      status: EventStatus.CANCELLED,
      currency: 'EUR',
      creatorId: creatorUser.id,
      venueId: palauSantJordi.id,
      genres: { connect: [{ id: gRock.id }] },
    },
  });

  // ── ÓRDENES Y PAGOS para eventos FINISHED ────────────────────────────────
  // Buyers disponibles: buyerUser, buyer1, buyer2, buyer3, buyer4

  const allBuyers = [buyerUser, buyer1, buyer2, buyer3, buyer4];

  // --- Granada Indie Night 2025 → 10 órdenes COMPLETED ---
  const indieOrders = [
    { buyer: buyerUser,  ttId: fi1General.id,    ttPrice: 35, qty: 4, tt2Id: fi1Preferente.id, tt2Price: 60, qty2: 2 },
    { buyer: buyer1,     ttId: fi1General.id,    ttPrice: 35, qty: 2, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyer2,     ttId: fi1Preferente.id, ttPrice: 60, qty: 4, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyer3,     ttId: fi1General.id,    ttPrice: 35, qty: 3, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyer4,     ttId: fi1General.id,    ttPrice: 35, qty: 2, tt2Id: fi1Preferente.id, tt2Price: 60, qty2: 1 },
    { buyer: buyer1,     ttId: fi1Preferente.id, ttPrice: 60, qty: 2, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyer2,     ttId: fi1General.id,    ttPrice: 35, qty: 4, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyer3,     ttId: fi1Preferente.id, ttPrice: 60, qty: 3, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyer4,     ttId: fi1General.id,    ttPrice: 35, qty: 2, tt2Id: null,              tt2Price: 0,  qty2: 0 },
    { buyer: buyerUser,  ttId: fi1General.id,    ttPrice: 35, qty: 3, tt2Id: null,              tt2Price: 0,  qty2: 0 },
  ];

  for (let i = 0; i < indieOrders.length; i++) {
    const o = indieOrders[i];
    const items: any[] = [
      { ticketTypeId: o.ttId, quantity: o.qty, unitPrice: String(o.ttPrice), subtotal: String(o.ttPrice * o.qty) },
    ];
    if (o.tt2Id) {
      items.push({ ticketTypeId: o.tt2Id, quantity: o.qty2, unitPrice: String(o.tt2Price), subtotal: String(o.tt2Price * o.qty2) });
    }
    const total = items.reduce((acc, it) => acc + parseFloat(it.subtotal), 0);

    const order = await prisma.order.create({
      data: {
        totalAmount: String(total.toFixed(2)),
        status: OrderStatus.COMPLETED,
        buyerId: o.buyer.id,
        eventId: finishedIndie.id,
        items: { create: items },
      },
    });

    await prisma.payment.create({
      data: {
        amount: String(total.toFixed(2)),
        currency: 'EUR',
        status: PaymentStatus.COMPLETED,
        provider: 'stripe',
        providerPaymentId: `pi_fi_${i + 1}_${order.id.slice(0, 8)}`,
        providerSessionId: `sess_fi_${i + 1}_${order.id.slice(0, 8)}`,
        paidAt: new Date('2025-08-10T14:00:00.000Z'),
        orderId: order.id,
      },
    });
  }

  // --- Madrid Rock Fest 2025 → 12 órdenes COMPLETED ---
  const rockOrders = [
    { buyer: buyerUser,  ttId: fr1General.id, ttPrice: 55, qty: 4, tt2Id: fr1Premium.id,  tt2Price: 110, qty2: 2 },
    { buyer: buyer1,     ttId: fr1General.id, ttPrice: 55, qty: 6, tt2Id: null,            tt2Price: 0,   qty2: 0 },
    { buyer: buyer2,     ttId: fr1Premium.id, ttPrice: 110, qty: 4, tt2Id: null,           tt2Price: 0,   qty2: 0 },
    { buyer: buyer3,     ttId: fr1General.id, ttPrice: 55, qty: 4, tt2Id: null,            tt2Price: 0,   qty2: 0 },
    { buyer: buyer4,     ttId: fr1General.id, ttPrice: 55, qty: 3, tt2Id: fr1Premium.id,  tt2Price: 110, qty2: 2 },
    { buyer: buyer1,     ttId: fr1Premium.id, ttPrice: 110, qty: 3, tt2Id: null,           tt2Price: 0,   qty2: 0 },
    { buyer: buyer2,     ttId: fr1General.id, ttPrice: 55, qty: 5, tt2Id: null,            tt2Price: 0,   qty2: 0 },
    { buyer: buyer3,     ttId: fr1Premium.id, ttPrice: 110, qty: 4, tt2Id: null,           tt2Price: 0,   qty2: 0 },
    { buyer: buyer4,     ttId: fr1General.id, ttPrice: 55, qty: 4, tt2Id: null,            tt2Price: 0,   qty2: 0 },
    { buyer: buyerUser,  ttId: fr1General.id, ttPrice: 55, qty: 2, tt2Id: null,            tt2Price: 0,   qty2: 0 },
    { buyer: buyer1,     ttId: fr1General.id, ttPrice: 55, qty: 6, tt2Id: fr1Premium.id,  tt2Price: 110, qty2: 1 },
    { buyer: buyer2,     ttId: fr1Premium.id, ttPrice: 110, qty: 2, tt2Id: null,           tt2Price: 0,   qty2: 0 },
  ];

  for (let i = 0; i < rockOrders.length; i++) {
    const o = rockOrders[i];
    const items: any[] = [
      { ticketTypeId: o.ttId, quantity: o.qty, unitPrice: String(o.ttPrice), subtotal: String(o.ttPrice * o.qty) },
    ];
    if (o.tt2Id) {
      items.push({ ticketTypeId: o.tt2Id, quantity: o.qty2, unitPrice: String(o.tt2Price), subtotal: String(o.tt2Price * o.qty2) });
    }
    const total = items.reduce((acc, it) => acc + parseFloat(it.subtotal), 0);

    const order = await prisma.order.create({
      data: {
        totalAmount: String(total.toFixed(2)),
        status: OrderStatus.COMPLETED,
        buyerId: o.buyer.id,
        eventId: finishedRock.id,
        items: { create: items },
      },
    });

    await prisma.payment.create({
      data: {
        amount: String(total.toFixed(2)),
        currency: 'EUR',
        status: PaymentStatus.COMPLETED,
        provider: 'stripe',
        providerPaymentId: `pi_fr_${i + 1}_${order.id.slice(0, 8)}`,
        providerSessionId: `sess_fr_${i + 1}_${order.id.slice(0, 8)}`,
        paidAt: new Date('2025-10-01T16:00:00.000Z'),
        orderId: order.id,
      },
    });
  }

  // ── Orden PENDING original del seed (conservada para pruebas de flow) ─────
  const urbanPista = await prisma.ticketType.findFirstOrThrow({
    where: { eventId: urbanFest.id, name: 'Pista' },
  });
  const pendingOrder = await prisma.order.create({
    data: {
      totalAmount: '90.00',
      status: OrderStatus.PENDING,
      buyerId: buyerUser.id,
      eventId: urbanFest.id,
      items: {
        create: [{ quantity: 2, unitPrice: urbanPista.price, subtotal: '90.00', ticketTypeId: urbanPista.id }],
      },
    },
  });
  await prisma.payment.create({
    data: {
      amount: '90.00',
      currency: 'EUR',
      status: PaymentStatus.PENDING,
      provider: 'stripe',
      providerSessionId: `sess_pending_${pendingOrder.id}`,
      orderId: pendingOrder.id,
    },
  });

  // ── Orden COMPLETED original del seed (conservada para pruebas de flow) ───
  const indieNightGeneral = await prisma.ticketType.findFirstOrThrow({
    where: { eventId: indieNight.id, name: 'General' },
  });
  const indieNightPreferente = await prisma.ticketType.findFirstOrThrow({
    where: { eventId: indieNight.id, name: 'Preferente' },
  });
  const completedOrder = await prisma.order.create({
    data: {
      totalAmount: '206.00',
      status: OrderStatus.COMPLETED,
      buyerId: buyerUser.id,
      eventId: indieNight.id,
      items: {
        create: [
          { quantity: 2, unitPrice: indieNightGeneral.price, subtotal: '76.00', ticketTypeId: indieNightGeneral.id },
          { quantity: 2, unitPrice: indieNightPreferente.price, subtotal: '130.00', ticketTypeId: indieNightPreferente.id },
        ],
      },
    },
  });
  await prisma.payment.createMany({
    data: [
      {
        amount: '206.00',
        currency: 'EUR',
        status: PaymentStatus.FAILED,
        provider: 'stripe',
        providerSessionId: `sess_fail_${completedOrder.id}`,
        failureReason: 'authentication_required',
        orderId: completedOrder.id,
      },
      {
        amount: '206.00',
        currency: 'EUR',
        status: PaymentStatus.COMPLETED,
        provider: 'stripe',
        providerPaymentId: `pi_ok_${completedOrder.id}`,
        providerSessionId: `sess_ok_${completedOrder.id}`,
        paidAt: new Date(),
        orderId: completedOrder.id,
      },
    ],
  });

  void allBuyers;

  // ── TICKETS para órdenes COMPLETED ────────────────────────────────────────
  // Genera tickets reales con hash + qrPayload para poder probar:
  //   RF-14 (QR cifrado), RF-15 (PDF download), RF-20 (SSE stats)

  // Helper: crea tickets para todos los OrderItems de una orden
  async function createTicketsForOrder(
    orderId: string,
    eventId: string,
    buyerId: string,
    validatedById?: string,
    forceStatus?: TicketStatus,
  ) {
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketId = crypto.randomUUID();
        const isUsed = forceStatus === TicketStatus.USED;
        await prisma.ticket.create({
          data: {
            id: ticketId,
            hash: makeHash(),
            qrPayload: makeQrPayload(ticketId),
            status: forceStatus ?? TicketStatus.ACTIVE,
            purchaseDate: new Date(),
            validatedAt: isUsed ? new Date('2025-09-20T21:30:00.000+02:00') : undefined,
            eventId,
            buyerId,
            ticketTypeId: item.ticketTypeId,
            orderId,
            orderItemId: item.id,
            validatedById: isUsed ? validatedById : undefined,
          },
        });
      }
    }
  }

  // Órdenes COMPLETED del buyerUser principal en eventos FINISHED
  // (los loops de indieOrders/rockOrders solo crean órdenes sin tickets)
  // Buscamos las órdenes del buyerUser en los eventos finished para crear sus tickets
  const buyerFinishedOrders = await prisma.order.findMany({
    where: {
      buyerId: buyerUser.id,
      status: OrderStatus.COMPLETED,
      eventId: { in: [finishedIndie.id, finishedRock.id] },
    },
  });

  for (const ord of buyerFinishedOrders) {
    await createTicketsForOrder(ord.id, ord.eventId, buyerUser.id, undefined, TicketStatus.USED);
  }

  // También tickets para los otros buyers en finishedIndie (algunos USED, mayoría ACTIVE→USED ya que el evento terminó)
  const otherBuyerFinishedOrders = await prisma.order.findMany({
    where: {
      buyerId: { in: [buyer1.id, buyer2.id, buyer3.id, buyer4.id] },
      status: OrderStatus.COMPLETED,
      eventId: { in: [finishedIndie.id, finishedRock.id] },
    },
  });

  for (const ord of otherBuyerFinishedOrders) {
    const buyer = [buyer1, buyer2, buyer3, buyer4].find((b) => b.id === ord.buyerId)!;
    await createTicketsForOrder(ord.id, ord.eventId, buyer.id, validatorUser.id, TicketStatus.USED);
  }

  // Orden COMPLETED del buyerUser en evento PUBLISHED (indieNight) — tickets ACTIVE
  // para poder probar RF-15 (PDF download) con un evento futuro
  await createTicketsForOrder(
    completedOrder.id,
    indieNight.id,
    buyerUser.id,
    undefined,
    TicketStatus.ACTIVE,
  );

  console.log('✅ Seed completado:');
  console.log('   - 8 usuarios (admin, creator, validator, user, 4 buyers)');
  console.log('   - 15 artistas, 8 venues, 7 formatos, 27 géneros');
  console.log('   - 20 eventos (12 PUBLISHED, 4 DRAFT, 2 FINISHED, 2 CANCELLED)');
  console.log('   - 22 órdenes con pagos para analytics (10 indie 2025 + 12 rock 2025)');
  console.log('   - Tickets reales: USED en eventos FINISHED, ACTIVE en evento PUBLISHED');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
