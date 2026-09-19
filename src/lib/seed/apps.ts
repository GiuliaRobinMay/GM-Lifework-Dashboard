import type { AppLink } from '@/lib/types';

/**
 * The launcher. Every tool you move between, as a link — not a rebuild.
 *
 * NO CLIENT APPEARS IN THIS LIST. A client's community URL identifies that
 * client, so client platforms are reached from the Clients zone only.
 *
 * `connected: true` means that tool ALSO has an MCP server wired into the
 * brain, so the dashboard can read its data as well as link to it. That
 * distinction is the whole point of the Launchpad: it shows at a glance
 * which of your tools this dashboard can actually think about.
 */
export const APPS: AppLink[] = [
  // Communities — her own only. Client communities are never listed here;
  // they are reached from the Clients zone, which reads Notion live.
  { id: 'quinb', name: 'QuinB Academy', url: 'https://quinb.mn.co', note: 'Your host community', category: 'Communities', domains: ['quinb-academy'], connected: false, pinned: true },

  // Work & delivery
  { id: 'notion', name: 'Notion', url: 'https://notion.so', note: 'Tasks, clients, goals', category: 'Work & Delivery', domains: ['clients', 'big-tribe-builders'], connected: true, pinned: true },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', note: 'Email', category: 'Work & Delivery', domains: [], connected: true, pinned: true },
  { id: 'gcal', name: 'Calendar', url: 'https://calendar.google.com', note: 'The week', category: 'Work & Delivery', domains: [], connected: true, pinned: true },
  { id: 'gdrive', name: 'Drive', url: 'https://drive.google.com', note: 'Files', category: 'Work & Delivery', domains: [], connected: true, pinned: false },
  { id: 'upwork', name: 'Upwork', url: 'https://www.upwork.com/nx/find-work/', note: 'Inbound work', category: 'Work & Delivery', domains: ['upwork'], connected: true, pinned: true },
  { id: 'zoom', name: 'Zoom', url: 'https://zoom.us', note: 'Calls and recordings', category: 'Work & Delivery', domains: [], connected: true, pinned: false },

  // Content & social
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/feed/', note: 'Primary channel', category: 'Content & Social', domains: ['content'], connected: false, pinned: true },
  { id: 'higgsfield', name: 'Higgsfield', url: 'https://higgsfield.ai', note: 'Video and image', category: 'Content & Social', domains: ['content'], connected: true, pinned: false },
  { id: 'youtube', name: 'YouTube Studio', url: 'https://studio.youtube.com', note: 'Long form', category: 'Content & Social', domains: ['content'], connected: false, pinned: false },
  { id: 'instagram', name: 'Instagram', url: 'https://instagram.com', note: 'Short form', category: 'Content & Social', domains: ['content'], connected: false, pinned: false },

  // Email & audience
  { id: 'kit', name: 'Kit', url: 'https://app.kit.com', note: 'Newsletter and sequences', category: 'Email & Audience', domains: ['giulia-may', 'content'], connected: true, pinned: false },

  // Build & deploy
  { id: 'github', name: 'GitHub', url: 'https://github.com/GiuliaRobinMay', note: 'Repositories', category: 'Build & Deploy', domains: ['apps'], connected: true, pinned: false },
  { id: 'netlify', name: 'Netlify', url: 'https://app.netlify.com', note: 'Static hosting', category: 'Build & Deploy', domains: ['apps'], connected: true, pinned: false },
  { id: 'gcloud', name: 'Google Cloud', url: 'https://console.cloud.google.com', note: 'Cloud Run, BigQuery', category: 'Build & Deploy', domains: ['apps'], connected: false, pinned: false },
  { id: 'supabase', name: 'Supabase', url: 'https://supabase.com/dashboard', note: 'This dashboard’s database', category: 'Build & Deploy', domains: ['apps'], connected: false, pinned: false },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', note: 'The thinking partner', category: 'Build & Deploy', domains: ['brain'], connected: true, pinned: true },

  // Money
  { id: 'stripe', name: 'Stripe', url: 'https://dashboard.stripe.com', note: 'Payments', category: 'Money', domains: ['accountancy'], connected: false, pinned: false },
  { id: 'accounting', name: 'Accounting', url: 'https://www.e-boekhouden.nl', note: 'Books and VAT', category: 'Money', domains: ['accountancy'], connected: false, pinned: false },

  // Learning
  { id: 'spi', name: 'SPI Academy', url: 'https://community.smartpassiveincome.com', note: 'Courses you follow', category: 'Learning', domains: ['studying'], connected: false, pinned: false },

  // Personal
  { id: 'strava', name: 'Strava', url: 'https://www.strava.com/dashboard', note: 'Training log', category: 'Personal', domains: ['fitness'], connected: false, pinned: false },
];
