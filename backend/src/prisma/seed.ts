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

function makeHash(): string {
  return crypto.randomBytes(16).toString('hex');
}

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
  { name: 'Concierto', slug: 'concierto', icon: '🎤', description: 'Show de uno o dos artistas, noche única' },
  { name: 'Festival', slug: 'festival', icon: '🎪', description: 'Múltiples artistas, puede ser multi-día' },
  { name: 'Tour', slug: 'tour', icon: '🚌', description: 'Fecha de una gira internacional' },
  { name: 'Acústico', slug: 'acustico', icon: '🪕', description: 'Formato íntimo' },
  { name: 'Arena Show', slug: 'arena-show', icon: '🏟️', description: 'Show masivo en estadio o arena' },
];

const genres = [
  { name: 'Progressive Rock', slug: 'progressive-rock' },
  { name: 'Classic Rock', slug: 'classic-rock' },
  { name: 'Avant-Garde', slug: 'avant-garde' },
  { name: 'Psychedelic Rock', slug: 'psychedelic-rock' },
  { name: 'Funk Rock', slug: 'funk-rock' },
  { name: 'Global Pop', slug: 'global-pop' },
  { name: 'Synth Pop', slug: 'synth-pop' },
  { name: 'Arena Rock', slug: 'arena-rock' },
  { name: 'Jazz Fusion', slug: 'jazz-fusion' },
  { name: 'Krautrock', slug: 'krautrock' },
];

const venues = [
  { name: 'Wembley Stadium', slug: 'wembley-stadium', address: 'London', city: 'London', state: 'England', country: 'UK', capacity: 90000, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1543165365-07232ed12fad?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Madison Square Garden', slug: 'madison-square-garden', address: 'New York', city: 'New York', state: 'NY', country: 'US', capacity: 19500, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1628189689886-f81d113f36a5?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Royal Albert Hall', slug: 'royal-albert-hall', address: 'Kensington Gore', city: 'London', state: 'England', country: 'UK', capacity: 5200, type: VenueType.TEATRO, imageUrl: 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?q=80&w=2070&auto=format&fit=crop' },
  { name: 'The O2 Arena', slug: 'o2-arena', address: 'Peninsula Square', city: 'London', state: 'England', country: 'UK', capacity: 20000, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' },
  { name: 'Red Rocks Amphitheatre', slug: 'red-rocks', address: 'Morrison', city: 'Denver', state: 'CO', country: 'US', capacity: 9500, type: VenueType.AL_AIRE_LIBRE, imageUrl: 'https://images.unsplash.com/photo-1520626337972-ebfdd6370e72?q=80&w=2069&auto=format&fit=crop' },
  { name: 'Estadio River Plate', slug: 'estadio-river-plate', address: 'Figueroa Alcorta', city: 'Buenos Aires', state: 'CABA', country: 'AR', capacity: 85000, type: VenueType.AL_AIRE_LIBRE, imageUrl: 'https://images.unsplash.com/photo-1540066019607-e5f6f4820293?q=80&w=2056&auto=format&fit=crop' },
  { name: 'Tokyo Dome', slug: 'tokyo-dome', address: 'Bunkyo', city: 'Tokyo', state: 'Tokyo', country: 'JP', capacity: 55000, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1974&auto=format&fit=crop' },
  { name: 'Sydney SuperDome', slug: 'sydney-dome', address: 'Olympic Blvd', city: 'Sydney', state: 'NSW', country: 'AU', capacity: 21000, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1525926671046-9d660eec49e4?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Palacio de los Deportes', slug: 'palacio-deportes-mx', address: 'Granjas México', city: 'Ciudad de México', state: 'CDMX', country: 'MX', capacity: 22000, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Ziggo Dome', slug: 'ziggo-dome', address: 'Zuidoostlaan 4', city: 'Amsterdam', state: 'Noord-Holland', country: 'NL', capacity: 17000, type: VenueType.ARENA, imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop' },
];

const artists = [
  // Prog Rock — Core
  { name: 'Yes', slug: 'yes', country: 'UK', bio: 'Pioneers of progressive rock known for complex arrangements.', genres: ['progressive-rock', 'classic-rock'], imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Camel', slug: 'camel', country: 'UK', bio: 'Melodic and symphonic progressive rock legends.', genres: ['progressive-rock'], imageUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f401?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Pink Floyd', slug: 'pink-floyd', country: 'UK', bio: 'Psychedelic and progressive rock icons.', genres: ['progressive-rock', 'psychedelic-rock', 'classic-rock'], imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Gentle Giant', slug: 'gentle-giant', country: 'UK', bio: 'Highly experimental and complex progressive rock band.', genres: ['progressive-rock', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1510915361894-faa8b2d744b8?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Frank Zappa', slug: 'frank-zappa', country: 'US', bio: 'Virtuoso musician bridging rock, jazz, and classical.', genres: ['avant-garde', 'progressive-rock', 'jazz-fusion'], imageUrl: 'https://images.unsplash.com/photo-1508215885820-4585e56108b9?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Captain Beefheart', slug: 'captain-beefheart', country: 'US', bio: 'Blues-rock and avant-garde innovator.', genres: ['avant-garde', 'psychedelic-rock'], imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Genesis', slug: 'genesis', country: 'UK', bio: 'Theatrical progressive rock pioneers.', genres: ['progressive-rock', 'classic-rock'], imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop' },
  { name: 'King Crimson', slug: 'king-crimson', country: 'UK', bio: 'The foundation of technical progressive rock.', genres: ['progressive-rock', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?q=80&w=2053&auto=format&fit=crop' },
  { name: 'Caravan', slug: 'caravan', country: 'UK', bio: 'Canterbury scene progressive rock.', genres: ['progressive-rock', 'psychedelic-rock'], imageUrl: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Van Der Graaf Generator', slug: 'van-der-graaf-generator', country: 'UK', bio: 'Dark and intense progressive rock.', genres: ['progressive-rock', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1533174000273-e18e82d7331d?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Steve Hillage', slug: 'steve-hillage', country: 'UK', bio: 'Space rock and progressive guitar virtuoso.', genres: ['progressive-rock', 'psychedelic-rock'], imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Led Zeppelin', slug: 'led-zeppelin', country: 'UK', bio: 'The ultimate classic hard rock band.', genres: ['classic-rock', 'arena-rock'], imageUrl: 'https://images.unsplash.com/photo-1516280440502-a2fe6cb7c166?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Funkadelic', slug: 'funkadelic', country: 'US', bio: 'Psychedelic funk rock visionaries.', genres: ['funk-rock', 'psychedelic-rock'], imageUrl: 'https://images.unsplash.com/photo-1469502900010-845610118be9?q=80&w=2072&auto=format&fit=crop' },

  // Prog Rock — Extended
  { name: 'ELP', slug: 'elp', country: 'UK', bio: 'Emerson, Lake & Palmer — keyboard-driven symphonic rock power trio.', genres: ['progressive-rock', 'classic-rock'], imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Jethro Tull', slug: 'jethro-tull', country: 'UK', bio: 'Flute-fronted progressive folk rock legends.', genres: ['progressive-rock', 'classic-rock'], imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Rush', slug: 'rush', country: 'CA', bio: 'Canadian prog rock power trio with virtuosic musicianship.', genres: ['progressive-rock', 'arena-rock'], imageUrl: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=2069&auto=format&fit=crop' },
  { name: 'Tangerine Dream', slug: 'tangerine-dream', country: 'DE', bio: 'Electronic krautrock and ambient synthesizer pioneers.', genres: ['krautrock', 'psychedelic-rock'], imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Can', slug: 'can', country: 'DE', bio: 'Experimental krautrock collective that redefined rhythm.', genres: ['krautrock', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?q=80&w=2067&auto=format&fit=crop' },
  { name: 'Magma', slug: 'magma', country: 'FR', bio: 'French prog innovators who invented the Zeuhl genre.', genres: ['progressive-rock', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Return to Forever', slug: 'return-to-forever', country: 'US', bio: "Chick Corea's jazz fusion powerhouse.", genres: ['jazz-fusion', 'progressive-rock'], imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Weather Report', slug: 'weather-report', country: 'US', bio: 'Landmark jazz fusion group led by Joe Zawinul and Wayne Shorter.', genres: ['jazz-fusion', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Soft Machine', slug: 'soft-machine', country: 'UK', bio: 'Canterbury psychedelic and jazz-influenced avant-garde.', genres: ['progressive-rock', 'jazz-fusion', 'avant-garde'], imageUrl: 'https://images.unsplash.com/photo-1495778964792-17fa1b1c2eff?q=80&w=2013&auto=format&fit=crop' },

  // Global Pop
  { name: 'Taylor Swift', slug: 'taylor-swift', country: 'US', bio: 'Global pop superstar dominating stadiums worldwide.', genres: ['global-pop'], imageUrl: 'https://images.unsplash.com/photo-1483821838626-d62157d620ce?q=80&w=1969&auto=format&fit=crop' },
  { name: 'Coldplay', slug: 'coldplay', country: 'UK', bio: 'Global pop and arena rock sensations.', genres: ['global-pop', 'arena-rock'], imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' },
  { name: 'The Weeknd', slug: 'the-weeknd', country: 'CA', bio: 'Synth pop and R&B global star.', genres: ['global-pop', 'synth-pop'], imageUrl: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Dua Lipa', slug: 'dua-lipa', country: 'UK', bio: 'Dance-pop and synth-pop icon.', genres: ['global-pop', 'synth-pop'], imageUrl: 'https://images.unsplash.com/photo-1500642700345-0d23588be2db?q=80&w=1999&auto=format&fit=crop' },
];

const seedEvents = [
  // ── LIVE DEMO ──────────────────────────────────────────────────────────────
  {
    name: 'Tech Live Demo Expo 2026',
    description: 'Evento especial para demostración en vivo de la plataforma VeriTix.',
    // 25 May 2026 18:00 hs España (CEST, UTC+2) = 16:00 UTC
    eventDate: new Date('2026-05-25T16:00:00.000Z'),
    doorsOpenTime: new Date('2026-05-25T14:00:00.000Z'),
    startSale: new Date('2026-01-01T10:00:00.000Z'),
    endSale: new Date('2026-05-25T15:00:00.000Z'),
    maxCapacity: 2000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'tech-live-demo-expo-2026',
    venueSlug: 'wembley-stadium',
    formatSlug: 'arena-show',
    genres: ['global-pop', 'arena-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'coldplay' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'taylor-swift' }
    ],
    tickets: [
      { name: 'General', description: 'Entrada General', price: '50.00', qty: 1500, max: 10 },
      { name: 'VIP', description: 'Acceso VIP', price: '100.00', qty: 500, max: 10 }
    ]
  },

  // ── PUBLISHED ──────────────────────────────────────────────────────────────
  {
    name: 'Ether Trip Masters 2026',
    description: 'Una noche épica de rock progresivo con los pioneros del género.',
    eventDate: new Date('2026-08-15T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-08-15T18:30:00.000Z'),
    startSale: new Date('2026-03-01T10:00:00.000Z'),
    endSale: new Date('2026-08-15T19:00:00.000Z'),
    maxCapacity: 5200,
    status: EventStatus.PUBLISHED,
    imageSeed: 'prog-rock-masters-2026',
    venueSlug: 'royal-albert-hall',
    formatSlug: 'concierto',
    genres: ['progressive-rock', 'classic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'pink-floyd' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'king-crimson' },
      { role: ArtistRole.OPENER, slug: 'camel' }
    ],
    tickets: [
      { name: 'Platea', description: 'Asientos numerados', price: '85.00', qty: 4000, max: 6 },
      { name: 'Palco VIP', description: 'Palco exclusivo', price: '150.00', qty: 1200, max: 4 }
    ]
  },
  {
    name: 'Global Pop Fest 2026',
    description: 'El festival pop más grande del mundo, juntando a las estrellas del momento.',
    eventDate: new Date('2026-07-20T19:00:00.000Z'),
    doorsOpenTime: new Date('2026-07-20T17:00:00.000Z'),
    startSale: new Date('2026-02-10T10:00:00.000Z'),
    endSale: new Date('2026-07-20T18:00:00.000Z'),
    maxCapacity: 85000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'global-pop-fest-2026',
    venueSlug: 'estadio-river-plate',
    formatSlug: 'festival',
    genres: ['global-pop', 'synth-pop'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'taylor-swift' },
      { role: ArtistRole.HEADLINER, slug: 'the-weeknd' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'dua-lipa' }
    ],
    tickets: [
      { name: 'Campo General', description: 'Campo de pie', price: '90.00', qty: 50000, max: 6 },
      { name: 'Platea Alta', description: 'Grada superior', price: '120.00', qty: 25000, max: 4 },
      { name: 'Campo VIP', description: 'Cercano al escenario', price: '250.00', qty: 10000, max: 4 }
    ]
  },
  {
    name: 'Avant-Garde & Complexity',
    description: 'Una noche de jazz fusión, rock y ritmos imposibles.',
    eventDate: new Date('2026-09-10T21:00:00.000Z'),
    doorsOpenTime: new Date('2026-09-10T19:00:00.000Z'),
    startSale: new Date('2026-04-01T10:00:00.000Z'),
    endSale: new Date('2026-09-10T20:00:00.000Z'),
    maxCapacity: 20000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'avant-garde-tour',
    venueSlug: 'o2-arena',
    formatSlug: 'tour',
    genres: ['avant-garde', 'progressive-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'frank-zappa' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'gentle-giant' },
      { role: ArtistRole.OPENER, slug: 'captain-beefheart' }
    ],
    tickets: [
      { name: 'General Admission', description: 'Standing area', price: '75.00', qty: 15000, max: 6 },
      { name: 'Seated Premium', description: 'Best views', price: '130.00', qty: 5000, max: 4 }
    ]
  },
  {
    name: 'Classic Legends Revival',
    description: 'Reviviendo los himnos del rock clásico.',
    eventDate: new Date('2026-10-05T20:30:00.000Z'),
    doorsOpenTime: new Date('2026-10-05T18:30:00.000Z'),
    startSale: new Date('2026-05-15T10:00:00.000Z'),
    endSale: new Date('2026-10-05T19:30:00.000Z'),
    maxCapacity: 19500,
    status: EventStatus.PUBLISHED,
    imageSeed: 'classic-legends-revival',
    venueSlug: 'madison-square-garden',
    formatSlug: 'arena-show',
    genres: ['classic-rock', 'arena-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'led-zeppelin' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'yes' }
    ],
    tickets: [
      { name: 'Floor', description: 'Floor standing', price: '150.00', qty: 10000, max: 4 },
      { name: 'Lower Bowl', description: 'Lower tier seats', price: '200.00', qty: 9500, max: 4 }
    ]
  },
  {
    name: 'Symphonic Rock Night',
    description: 'El rock se encuentra con la orquesta sinfónica.',
    eventDate: new Date('2026-11-12T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-11-12T19:00:00.000Z'),
    startSale: new Date('2026-06-01T10:00:00.000Z'),
    endSale: new Date('2026-11-12T19:30:00.000Z'),
    maxCapacity: 55000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'symphonic-rock-night',
    venueSlug: 'tokyo-dome',
    formatSlug: 'concierto',
    genres: ['progressive-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'genesis' },
      { role: ArtistRole.OPENER, slug: 'caravan' }
    ],
    tickets: [
      { name: 'Arena Standing', description: 'Pista central', price: '100.00', qty: 30000, max: 6 },
      { name: 'Reserved Seating', description: 'Asientos en grada', price: '140.00', qty: 25000, max: 4 }
    ]
  },
  {
    name: 'Psychedelic Funk Experience',
    description: 'Viaje espacial a los reinos del P-Funk.',
    eventDate: new Date('2026-08-25T21:00:00.000Z'),
    doorsOpenTime: new Date('2026-08-25T19:00:00.000Z'),
    startSale: new Date('2026-03-10T10:00:00.000Z'),
    endSale: new Date('2026-08-25T20:00:00.000Z'),
    maxCapacity: 21000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'funkadelic-arena',
    venueSlug: 'sydney-dome',
    formatSlug: 'arena-show',
    genres: ['funk-rock', 'psychedelic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'funkadelic' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'steve-hillage' }
    ],
    tickets: [
      { name: 'Mosh Pit', description: 'Pista libre', price: '110.00', qty: 15000, max: 6 },
      { name: 'Upper Tier', description: 'Grada superior', price: '85.00', qty: 6000, max: 6 }
    ]
  },
  {
    name: 'Intimate Prog Evening',
    description: 'Rock progresivo en estado puro bajo el cielo abierto.',
    eventDate: new Date('2026-09-18T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-09-18T18:30:00.000Z'),
    startSale: new Date('2026-01-20T10:00:00.000Z'),
    endSale: new Date('2026-09-18T19:30:00.000Z'),
    maxCapacity: 9500,
    status: EventStatus.PUBLISHED,
    imageSeed: 'intimate-prog-evening',
    venueSlug: 'red-rocks',
    formatSlug: 'acustico',
    genres: ['progressive-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'van-der-graaf-generator' },
      { role: ArtistRole.OPENER, slug: 'soft-machine' }
    ],
    tickets: [
      { name: 'General Admission', description: 'Gradas al aire libre', price: '70.00', qty: 9500, max: 6 }
    ]
  },
  {
    name: 'ELP — Brain Salute Tour',
    description: 'La potencia de teclados y percusión de Emerson, Lake & Palmer en vivo.',
    eventDate: new Date('2026-10-22T20:30:00.000Z'),
    doorsOpenTime: new Date('2026-10-22T19:00:00.000Z'),
    startSale: new Date('2026-05-01T10:00:00.000Z'),
    endSale: new Date('2026-10-22T19:30:00.000Z'),
    maxCapacity: 17000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'elp-brain-salute-tour',
    venueSlug: 'ziggo-dome',
    formatSlug: 'tour',
    genres: ['progressive-rock', 'classic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'elp' },
      { role: ArtistRole.OPENER, slug: 'jethro-tull' }
    ],
    tickets: [
      { name: 'General', description: 'Acceso general', price: '95.00', qty: 12000, max: 6 },
      { name: 'Premium', description: 'Zona premium con mejor vista', price: '160.00', qty: 5000, max: 4 }
    ]
  },
  {
    name: 'Rush — A Farewell to Kings Redux',
    description: 'La legendaria trilogía de Rush interpretada en su totalidad.',
    eventDate: new Date('2026-11-05T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-11-05T18:30:00.000Z'),
    startSale: new Date('2026-06-15T10:00:00.000Z'),
    endSale: new Date('2026-11-05T19:00:00.000Z'),
    maxCapacity: 19500,
    status: EventStatus.PUBLISHED,
    imageSeed: 'rush-farewell-kings',
    venueSlug: 'madison-square-garden',
    formatSlug: 'arena-show',
    genres: ['progressive-rock', 'arena-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'rush' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'yes' }
    ],
    tickets: [
      { name: 'Floor', description: 'Floor general', price: '130.00', qty: 10000, max: 4 },
      { name: 'Tier 1', description: 'Primer anillo', price: '180.00', qty: 9500, max: 4 }
    ]
  },
  {
    name: 'Krautrock Cosmos',
    description: 'Can y Tangerine Dream juntos en una noche de exploración electrónica y ritmo.',
    eventDate: new Date('2026-12-03T21:00:00.000Z'),
    doorsOpenTime: new Date('2026-12-03T19:30:00.000Z'),
    startSale: new Date('2026-07-01T10:00:00.000Z'),
    endSale: new Date('2026-12-03T20:30:00.000Z'),
    maxCapacity: 5200,
    status: EventStatus.PUBLISHED,
    imageSeed: 'krautrock-cosmos',
    venueSlug: 'royal-albert-hall',
    formatSlug: 'concierto',
    genres: ['krautrock', 'avant-garde', 'psychedelic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'tangerine-dream' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'can' }
    ],
    tickets: [
      { name: 'Platea', description: 'Asiento numerado', price: '80.00', qty: 4000, max: 6 },
      { name: 'Balcón VIP', description: 'Vista panorámica exclusiva', price: '140.00', qty: 1200, max: 4 }
    ]
  },
  {
    name: 'Jazz Fusion Summit',
    description: 'Return to Forever y Weather Report, la cumbre del jazz-rock fusión.',
    eventDate: new Date('2026-09-27T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-09-27T18:30:00.000Z'),
    startSale: new Date('2026-04-15T10:00:00.000Z'),
    endSale: new Date('2026-09-27T19:00:00.000Z'),
    maxCapacity: 22000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'jazz-fusion-summit',
    venueSlug: 'palacio-deportes-mx',
    formatSlug: 'festival',
    genres: ['jazz-fusion', 'progressive-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'return-to-forever' },
      { role: ArtistRole.HEADLINER, slug: 'weather-report' },
      { role: ArtistRole.OPENER, slug: 'soft-machine' }
    ],
    tickets: [
      { name: 'General', description: 'Acceso general', price: '70.00', qty: 16000, max: 6 },
      { name: 'VIP Pit', description: 'Zona delantera exclusiva', price: '150.00', qty: 6000, max: 4 }
    ]
  },
  {
    name: 'Magma — Köhntarkösz Live',
    description: 'Magma interpreta Köhntarkösz íntegramente — una experiencia de otro mundo.',
    eventDate: new Date('2026-10-15T21:00:00.000Z'),
    doorsOpenTime: new Date('2026-10-15T19:30:00.000Z'),
    startSale: new Date('2026-05-20T10:00:00.000Z'),
    endSale: new Date('2026-10-15T20:30:00.000Z'),
    maxCapacity: 9500,
    status: EventStatus.PUBLISHED,
    imageSeed: 'magma-kohntarkoesz',
    venueSlug: 'red-rocks',
    formatSlug: 'concierto',
    genres: ['progressive-rock', 'avant-garde'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'magma' },
      { role: ArtistRole.OPENER, slug: 'gentle-giant' }
    ],
    tickets: [
      { name: 'Open Air General', description: 'Gradas descubiertas', price: '65.00', qty: 9500, max: 6 }
    ]
  },
  {
    name: 'Jethro Tull — Thick as a Brick Tour',
    description: 'Ian Anderson y su flauta lideran la interpretación completa de Thick as a Brick.',
    eventDate: new Date('2026-11-28T19:30:00.000Z'),
    doorsOpenTime: new Date('2026-11-28T18:00:00.000Z'),
    startSale: new Date('2026-07-01T10:00:00.000Z'),
    endSale: new Date('2026-11-28T18:30:00.000Z'),
    maxCapacity: 20000,
    status: EventStatus.PUBLISHED,
    imageSeed: 'jethro-tull-thick-brick',
    venueSlug: 'o2-arena',
    formatSlug: 'tour',
    genres: ['progressive-rock', 'classic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'jethro-tull' },
      { role: ArtistRole.SPECIAL_GUEST, slug: 'camel' }
    ],
    tickets: [
      { name: 'Standing', description: 'Zona de pie', price: '90.00', qty: 14000, max: 6 },
      { name: 'Seated', description: 'Asientos numerados', price: '120.00', qty: 6000, max: 4 }
    ]
  },

  // ── FINISHED ───────────────────────────────────────────────────────────────
  {
    name: 'Led Zeppelin Return 2025',
    description: 'El espectacular regreso de la banda más grande del mundo.',
    eventDate: new Date('2025-05-10T21:00:00.000Z'),
    doorsOpenTime: new Date('2025-05-10T18:00:00.000Z'),
    startSale: new Date('2024-12-01T10:00:00.000Z'),
    endSale: new Date('2025-05-10T20:00:00.000Z'),
    maxCapacity: 85000,
    status: EventStatus.FINISHED,
    imageSeed: 'led-zeppelin-2025',
    venueSlug: 'estadio-river-plate',
    formatSlug: 'arena-show',
    genres: ['classic-rock', 'arena-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'led-zeppelin' }
    ],
    tickets: [
      { name: 'Campo', description: 'General', price: '80.00', qty: 85000, max: 6 }
    ]
  },
  {
    name: 'Pink Floyd MSG 2025',
    description: 'La histórica presentación de Pink Floyd.',
    eventDate: new Date('2025-10-20T20:00:00.000Z'),
    doorsOpenTime: new Date('2025-10-20T18:30:00.000Z'),
    startSale: new Date('2025-05-01T10:00:00.000Z'),
    endSale: new Date('2025-10-20T19:00:00.000Z'),
    maxCapacity: 19500,
    status: EventStatus.FINISHED,
    imageSeed: 'pink-floyd-msg',
    venueSlug: 'madison-square-garden',
    formatSlug: 'tour',
    genres: ['progressive-rock', 'classic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'pink-floyd' }
    ],
    tickets: [
      { name: 'General', description: 'General', price: '120.00', qty: 19500, max: 4 }
    ]
  },
  {
    name: 'King Crimson — Court of the Crimson King 2025',
    description: 'King Crimson interpreta su álbum debut íntegramente.',
    eventDate: new Date('2025-07-12T20:00:00.000Z'),
    doorsOpenTime: new Date('2025-07-12T18:30:00.000Z'),
    startSale: new Date('2025-02-01T10:00:00.000Z'),
    endSale: new Date('2025-07-12T19:00:00.000Z'),
    maxCapacity: 5200,
    status: EventStatus.FINISHED,
    imageSeed: 'king-crimson-court-2025',
    venueSlug: 'royal-albert-hall',
    formatSlug: 'concierto',
    genres: ['progressive-rock', 'avant-garde'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'king-crimson' },
      { role: ArtistRole.OPENER, slug: 'van-der-graaf-generator' }
    ],
    tickets: [
      { name: 'Platea', description: 'Asiento numerado', price: '100.00', qty: 5200, max: 4 }
    ]
  },

  // ── DRAFT ──────────────────────────────────────────────────────────────────
  {
    name: 'Pop Superstars Draft',
    description: 'Borrador de un evento pop masivo.',
    eventDate: new Date('2026-12-01T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-12-01T18:00:00.000Z'),
    startSale: new Date('2026-08-01T10:00:00.000Z'),
    endSale: new Date('2026-12-01T19:00:00.000Z'),
    maxCapacity: 90000,
    status: EventStatus.DRAFT,
    imageSeed: '',
    venueSlug: 'wembley-stadium',
    formatSlug: 'arena-show',
    genres: ['global-pop'],
    artists: [],
    tickets: []
  },
  {
    name: 'Experimental Rock Draft',
    description: 'Evento de rock experimental sin entradas configuradas.',
    eventDate: new Date('2027-02-15T21:00:00.000Z'),
    doorsOpenTime: new Date('2027-02-15T19:00:00.000Z'),
    startSale: new Date('2026-10-01T10:00:00.000Z'),
    endSale: new Date('2027-02-15T20:00:00.000Z'),
    maxCapacity: 5200,
    status: EventStatus.DRAFT,
    imageSeed: 'experimental-rock',
    venueSlug: 'royal-albert-hall',
    formatSlug: 'concierto',
    genres: ['avant-garde', 'progressive-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'frank-zappa' }
    ],
    tickets: []
  },

  // ── CANCELLED ──────────────────────────────────────────────────────────────
  {
    name: 'The Wall Tribute (Cancelled)',
    description: 'Tributo cancelado por problemas de logística.',
    eventDate: new Date('2026-04-10T20:00:00.000Z'),
    doorsOpenTime: new Date('2026-04-10T18:00:00.000Z'),
    startSale: new Date('2025-11-01T10:00:00.000Z'),
    endSale: new Date('2026-04-10T19:00:00.000Z'),
    maxCapacity: 20000,
    status: EventStatus.CANCELLED,
    imageSeed: 'wall-tribute',
    venueSlug: 'o2-arena',
    formatSlug: 'concierto',
    genres: ['progressive-rock', 'classic-rock'],
    artists: [
      { role: ArtistRole.HEADLINER, slug: 'pink-floyd' }
    ],
    tickets: [
      { name: 'General', description: 'General', price: '70.00', qty: 20000, max: 6 }
    ]
  }
];

// ─── SEED MAIN ────────────────────────────────────────────────────────────────

async function main() {
  // Limpiar BD idempotencia
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.event.deleteMany({});

  // ── Usuarios ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(`${process.env.ADMIN_PASSWORD || 'Admin1234!'}`, 12);
  const userPassword = await bcrypt.hash(`${process.env.USER_PASSWORD || 'User1234!'}`, 12);
  const defaultBuyerPassword = await bcrypt.hash('Buyer1234!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@veritix.app' },
    update: {},
    create: { email: 'admin@veritix.app', phone: '+34958000001', name: 'Admin', lastName: 'VeriTix', password: adminPassword, role: Role.ADMIN, isActive: true, emailVerified: true },
  });
  void adminUser;

  const buyerUser = await prisma.user.upsert({
    where: { email: 'user@veritix.app' },
    update: {},
    create: { email: 'user@veritix.app', phone: '+34958000002', name: 'User', lastName: 'VeriTix', password: userPassword, role: Role.BUYER, isActive: true, emailVerified: true },
  });

  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@veritix.app' },
    update: {},
    create: { email: 'creator@veritix.app', phone: '+34958000003', name: 'Creator', lastName: 'Demo', password: userPassword, role: Role.CREATOR, isActive: true, emailVerified: true },
  });

  const validatorUser = await prisma.user.upsert({
    where: { email: 'validator@veritix.app' },
    update: {},
    create: { email: 'validator@veritix.app', phone: '+34958000004', name: 'Validator', lastName: 'Demo', password: userPassword, role: Role.VALIDATOR, isActive: true, emailVerified: true },
  });

  const extraBuyers = [
    { email: 'buyer1@veritix.app', phone: '+34958000010', name: 'Ana', lastName: 'García' },
    { email: 'buyer2@veritix.app', phone: '+34958000011', name: 'Carlos', lastName: 'Martínez' },
    { email: 'buyer3@veritix.app', phone: '+34958000012', name: 'Sofía', lastName: 'López' },
    { email: 'buyer4@veritix.app', phone: '+34958000013', name: 'Miguel', lastName: 'Fernández' },
  ];

  const createdExtraBuyers = [];
  for (const buyer of extraBuyers) {
    createdExtraBuyers.push(await prisma.user.upsert({
      where: { email: buyer.email },
      update: {},
      create: { ...buyer, password: defaultBuyerPassword, role: Role.BUYER, isActive: true, emailVerified: true },
    }));
  }
  const allBuyers = [buyerUser, ...createdExtraBuyers];

  // ── Catálogos ─────────────────────────────────────────────────────────────
  for (const format of concertFormats) {
    await prisma.concertFormat.upsert({ where: { slug: format.slug }, update: {}, create: format });
  }

  for (const genre of genres) {
    await prisma.genre.upsert({ where: { slug: genre.slug }, update: {}, create: genre });
  }

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        capacity: venue.capacity,
        type: venue.type,
        imageUrl: venue.imageUrl
      },
      create: venue
    });
  }

  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { slug: artist.slug },
      update: { name: artist.name, country: artist.country, bio: artist.bio, imageUrl: artist.imageUrl, genres: { set: [], connect: artist.genres.map(slug => ({ slug })) } },
      create: { name: artist.name, slug: artist.slug, country: artist.country, bio: artist.bio, imageUrl: artist.imageUrl, genres: { connect: artist.genres.map(slug => ({ slug })) } },
    });
  }

  // ── Resolver IDs ─────────────────────────────────────────────────────────
  const venuesMap = new Map((await prisma.venue.findMany()).map(v => [v.slug, v.id]));
  const formatsMap = new Map((await prisma.concertFormat.findMany()).map(f => [f.slug, f.id]));
  const genresMap = new Map((await prisma.genre.findMany()).map(g => [g.slug, g.id]));
  const artistsMap = new Map((await prisma.artist.findMany()).map(a => [a.slug, a.id]));

  // ── Crear Eventos ────────────────────────────────────────────────────────
  for (const seed of seedEvents) {
    const event = await prisma.event.create({
      data: {
        name: seed.name,
        description: seed.description,
        eventDate: seed.eventDate,
        doorsOpenTime: seed.doorsOpenTime,
        startSale: seed.startSale,
        endSale: seed.endSale,
        maxCapacity: seed.maxCapacity,
        status: seed.status,
        currency: 'EUR',
        imageUrl: seed.imageSeed ? `https://picsum.photos/seed/${seed.imageSeed}/800/450` : null,
        creatorId: creatorUser.id,
        venueId: venuesMap.get(seed.venueSlug)!,
        formatId: formatsMap.get(seed.formatSlug)!,
        genres: { connect: seed.genres.map(g => ({ id: genresMap.get(g)! })) },
        artists: {
          create: seed.artists.map((a, i) => ({
            role: a.role,
            performanceOrder: i + 1,
            artistId: artistsMap.get(a.slug)!
          }))
        }
      }
    });

    if (seed.tickets.length > 0) {
      await prisma.ticketType.createMany({
        data: seed.tickets.map(t => ({
          name: t.name,
          description: t.description,
          price: t.price,
          totalQuantity: t.qty,
          availableQuantity: seed.status === EventStatus.FINISHED ? 0 : t.qty,
          maxPerUser: t.max,
          eventId: event.id,
          saleStartDate: seed.startSale,
          saleEndDate: seed.endSale,
        }))
      });
    }
  }

  // ── Helper Generar Tickets de Orden ──────────────────────────────────────
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
            validatedAt: isUsed ? new Date() : undefined,
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

  // ── Órdenes de Demo Expo ─────────────────────────────────────────────────
  // Target: 2000 tickets ACTIVE (500 General + 1500 VIP spread across 100 orders of 20 tickets each)
  const demoEvent = await prisma.event.findFirst({ where: { name: 'Tech Live Demo Expo 2026' }, include: { ticketTypes: true } });
  if (demoEvent) {
    console.log('Generando 2000 tickets para el evento Tech Live Demo Expo 2026...');
    const ttGeneral = demoEvent.ticketTypes.find(t => t.name === 'General')!;
    const ttVip = demoEvent.ticketTypes.find(t => t.name === 'VIP')!;

    // 100 orders × 20 tickets = 2000 tickets
    // First 25 orders → VIP (25 × 20 = 500 VIP tickets)
    // Last 75 orders → General (75 × 20 = 1500 General tickets)
    for (let i = 0; i < 100; i++) {
      const isVip = i < 25;
      const tt = isVip ? ttVip : ttGeneral;

      const order = await prisma.order.create({
        data: {
          totalAmount: String((parseFloat(tt.price.toString()) * 20).toFixed(2)),
          status: OrderStatus.COMPLETED,
          buyerId: buyerUser.id,
          eventId: demoEvent.id,
          items: {
            create: [{
              ticketTypeId: tt.id,
              quantity: 20,
              unitPrice: String(tt.price),
              subtotal: String((parseFloat(tt.price.toString()) * 20).toFixed(2))
            }]
          }
        }
      });

      await prisma.payment.create({
        data: {
          amount: order.totalAmount,
          currency: 'EUR',
          status: PaymentStatus.COMPLETED,
          provider: 'stripe',
          providerPaymentId: `pi_demo_${i}_${order.id.slice(0, 8)}`,
          providerSessionId: `sess_demo_${i}_${order.id.slice(0, 8)}`,
          paidAt: new Date(),
          orderId: order.id
        }
      });

      await createTicketsForOrder(order.id, demoEvent.id, buyerUser.id, undefined, TicketStatus.ACTIVE);
    }
    console.log('✅ 2000 tickets generados con éxito para la demo.');
  }

  // ── Órdenes de Eventos PUBLISHED ────────────────────────────────────────
  // Popularidad por evento: % de tickets vendidos de cada ticket type
  const publishedSalesConfig: Record<string, number> = {
    'Ether Trip Masters 2026':              0.72,  // sold out casi
    'Global Pop Fest 2026':                 0.65,
    'Avant-Garde & Complexity':             0.40,
    'Classic Legends Revival':              0.78,
    'Symphonic Rock Night':                 0.55,
    'Psychedelic Funk Experience':          0.48,
    'Intimate Prog Evening':                0.22,
    'ELP — Brain Salute Tour':              0.45,
    'Rush — A Farewell to Kings Redux':     0.80,
    'Krautrock Cosmos':                     0.18,
    'Jazz Fusion Summit':                   0.35,
    'Magma — Köhntarkösz Live':             0.15,
    'Jethro Tull — Thick as a Brick Tour':  0.52,
  };

  const publishedEvents = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED, name: { not: 'Tech Live Demo Expo 2026' } },
    include: { ticketTypes: true },
  });

  for (const ev of publishedEvents) {
    const pct = publishedSalesConfig[ev.name] ?? 0.30;
    console.log(`Generando ventas para: ${ev.name} (${Math.round(pct * 100)}% vendido)...`);

    for (const tt of ev.ticketTypes) {
      const totalToSell = Math.floor(tt.totalQuantity * pct);
      let sold = 0;
      let orderIndex = 0;

      while (sold < totalToSell) {
        const buyer = allBuyers[orderIndex % allBuyers.length];
        // Órdenes de 1 a 4 tickets, realistas
        const qty = Math.min(
          [1, 2, 2, 3, 4][orderIndex % 5],
          totalToSell - sold,
          tt.maxPerUser,
        );

        const unitPrice = parseFloat(tt.price.toString());
        const subtotal  = (unitPrice * qty).toFixed(2);

        // Fecha de compra aleatoria entre apertura de venta y 2 días antes del evento
        const saleStart  = tt.saleStartDate?.getTime() ?? ev.eventDate.getTime() - 90 * 86400000;
        const saleEnd    = ev.eventDate.getTime() - 2 * 86400000;
        const purchasedAt = new Date(saleStart + Math.random() * (saleEnd - saleStart));

        const order = await prisma.order.create({
          data: {
            totalAmount: subtotal,
            status: OrderStatus.COMPLETED,
            buyerId: buyer.id,
            eventId: ev.id,
            items: {
              create: [{
                ticketTypeId: tt.id,
                quantity: qty,
                unitPrice: String(tt.price),
                subtotal,
              }],
            },
          },
        });

        await prisma.payment.create({
          data: {
            amount: subtotal,
            currency: 'EUR',
            status: PaymentStatus.COMPLETED,
            provider: 'stripe',
            providerPaymentId: `pi_pub_${ev.id.slice(0, 6)}_${orderIndex}`,
            providerSessionId: `sess_pub_${ev.id.slice(0, 6)}_${orderIndex}`,
            paidAt: purchasedAt,
            orderId: order.id,
          },
        });

        await createTicketsForOrder(order.id, ev.id, buyer.id, undefined, TicketStatus.ACTIVE);

        sold += qty;
        orderIndex++;
      }

      // Descontar del availableQuantity
      await prisma.ticketType.update({
        where: { id: tt.id },
        data: { availableQuantity: tt.totalQuantity - sold },
      });
    }
  }

  // ── Órdenes de Eventos Finalizados ────────────────────────────────────────
  const finishedEvents = await prisma.event.findMany({ where: { status: EventStatus.FINISHED }, include: { ticketTypes: true } });
  for (const ev of finishedEvents) {
    console.log(`Generando órdenes para evento finalizado: ${ev.name}...`);
    for (let i = 0; i < 15; i++) {
      const tt = ev.ticketTypes[0];
      const buyer = allBuyers[i % allBuyers.length];

      const order = await prisma.order.create({
        data: {
          totalAmount: String((parseFloat(tt.price.toString()) * 2).toFixed(2)),
          status: OrderStatus.COMPLETED,
          buyerId: buyer.id,
          eventId: ev.id,
          items: {
            create: [{
              ticketTypeId: tt.id,
              quantity: 2,
              unitPrice: String(tt.price),
              subtotal: String((parseFloat(tt.price.toString()) * 2).toFixed(2))
            }]
          }
        }
      });

      await prisma.payment.create({
        data: {
          amount: order.totalAmount,
          currency: 'EUR',
          status: PaymentStatus.COMPLETED,
          provider: 'stripe',
          providerPaymentId: `pi_fin_${i}_${order.id.slice(0, 8)}`,
          providerSessionId: `sess_fin_${i}_${order.id.slice(0, 8)}`,
          paidAt: new Date(ev.eventDate.getTime() - 86400000),
          orderId: order.id
        }
      });

      await createTicketsForOrder(order.id, ev.id, buyer.id, validatorUser.id, TicketStatus.USED);
    }
  }

  console.log('✅ Seed completado con éxito — Progressive Rock Universe + Pop Global.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
