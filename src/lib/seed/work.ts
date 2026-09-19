import type {
  Task, ContentItem, Course, GoalPeriod, Signal,
} from '@/lib/types';

/**
 * Seed rows for the surfaces that are not yet wired to a live source.
 *
 * NOTHING HERE MAY NAME OR DESCRIBE A CLIENT. Client work lives in Notion and
 * is read at request time by src/lib/notion.ts. These rows cover her own
 * ventures and her own life only — the two things this dashboard is allowed
 * to hold.
 *
 * Everything is shaped exactly like the Supabase tables, so replacing it is a
 * matter of swapping the reader in src/lib/data, not rewriting the UI.
 */

export const TASKS: Task[] = [
  // Ventures — her own businesses, which live in GN_tasks.
  { id: 't1', title: 'Write chapter 9', source: 'gn_tasks', clientId: null, clientName: null, area: 'Admin & Business', status: 'in_progress', priority: 'high', dueDate: '2026-09-30', doDate: '2026-09-19', domain: 'giulia-may' },
  { id: 't2', title: 'Record the BTB ribbon walkthrough', source: 'gn_tasks', clientId: null, clientName: null, area: 'Sales', status: 'inbox', priority: null, dueDate: null, doDate: null, domain: 'big-tribe-builders' },
  { id: 't3', title: 'Rewrite the ROOTS one-pager', source: 'gn_tasks', clientId: null, clientName: null, area: 'Sales', status: 'next', priority: 'medium', dueDate: '2026-09-25', doDate: null, domain: 'big-tribe-builders' },
  { id: 't4', title: 'September meetup prep', source: 'gn_tasks', clientId: null, clientName: null, area: 'Admin & Business', status: 'next', priority: 'medium', dueDate: '2026-09-24', doDate: null, domain: 'quinb-academy' },
  { id: 't5', title: 'Draft the welcome sequence', source: 'gn_tasks', clientId: null, clientName: null, area: 'Admin & Business', status: 'next', priority: null, dueDate: null, doDate: null, domain: 'quinb-academy' },
  { id: 't6', title: 'Book the podcast round', source: 'gn_tasks', clientId: null, clientName: null, area: 'Sales', status: 'waiting_on', priority: null, dueDate: null, doDate: null, domain: 'giulia-may' },

  // Life.
  { id: 't7',  title: 'Learn n8n', source: 'gn_tasks', clientId: null, clientName: null, area: 'Personal Development', status: 'next', priority: null, dueDate: null, doDate: null, domain: 'studying' },
  { id: 't8',  title: 'Finish Smart Offer Design', source: 'gn_tasks', clientId: null, clientName: null, area: 'Personal Development', status: 'in_progress', priority: null, dueDate: null, doDate: '2026-09-19', domain: 'studying' },
  { id: 't9',  title: 'Run three times this week', source: 'gn_tasks', clientId: null, clientName: null, area: 'Sports', status: 'in_progress', priority: null, dueDate: '2026-09-21', doDate: null, domain: 'fitness' },
  { id: 't10', title: 'Q3 VAT filing', source: 'gn_tasks', clientId: null, clientName: null, area: 'Admin & Business', status: 'next', priority: 'urgent', dueDate: '2026-10-20', doDate: null, domain: 'accountancy' },
  { id: 't11', title: 'Chase the September invoices', source: 'gn_tasks', clientId: null, clientName: null, area: 'Admin & Business', status: 'next', priority: 'high', dueDate: '2026-09-20', doDate: null, domain: 'accountancy' },

  // Content.
  { id: 't12', title: 'Approve this week’s LinkedIn posts', source: 'gn_tasks', clientId: null, clientName: null, area: 'Sales', status: 'next', priority: 'high', dueDate: '2026-09-19', doDate: '2026-09-19', domain: 'content' },
];

export const CONTENT: ContentItem[] = [
  { id: 'c1', title: 'The community that quietly died', channel: 'LinkedIn', state: 'review', scheduledFor: '2026-09-19', campaign: 'Book runway', venture: 'giulia-may' },
  { id: 'c2', title: 'Why your onboarding is the whole product', channel: 'LinkedIn', state: 'scheduled', scheduledFor: '2026-09-22', campaign: 'ROOTS teaching', venture: 'btb' },
  { id: 'c3', title: 'Build big, stay human — what it means in practice', channel: 'Newsletter', state: 'drafting', scheduledFor: '2026-09-24', campaign: 'Book runway', venture: 'btb' },
  { id: 'c4', title: 'The octopus with eight brains', channel: 'LinkedIn', state: 'idea', scheduledFor: null, campaign: null, venture: 'giulia-may' },
  { id: 'c5', title: 'Five signs your community is too big for one host', channel: 'YouTube', state: 'idea', scheduledFor: null, campaign: 'ROOTS teaching', venture: 'btb' },
  { id: 'c6', title: 'Inside the academy — a host’s week', channel: 'Newsletter', state: 'published', scheduledFor: '2026-09-15', campaign: null, venture: 'quinb' },
  { id: 'c7', title: 'What I learned launching on my father’s birthday', channel: 'LinkedIn', state: 'published', scheduledFor: '2026-09-12', campaign: 'Book runway', venture: 'giulia-may' },
];

export const COURSES: Course[] = [
  { id: 'co1', title: 'Smart Offer Design', provider: 'SPI Academy', lessonsTotal: 6, lessonsDone: 1, state: 'studying', nextLesson: 'Part 1 — Module 1 · 18 min', url: 'https://community.smartpassiveincome.com' },
  { id: 'co2', title: 'Lead Magnet Mini-Series', provider: 'SPI Academy', lessonsTotal: 5, lessonsDone: 2, state: 'studying', nextLesson: 'Part 3 — the delivery sequence', url: 'https://community.smartpassiveincome.com' },
  { id: 'co3', title: 'Landing Pages 101', provider: 'SPI Academy', lessonsTotal: 8, lessonsDone: 8, state: 'done', nextLesson: null, url: 'https://community.smartpassiveincome.com' },
  { id: 'co4', title: 'Email Marketing Magic', provider: 'SPI Academy', lessonsTotal: 7, lessonsDone: 0, state: 'to_study', nextLesson: 'Part 1 — the welcome sequence', url: 'https://community.smartpassiveincome.com' },
  { id: 'co5', title: 'n8n automation', provider: 'Self-directed', lessonsTotal: 12, lessonsDone: 3, state: 'studying', nextLesson: 'Webhooks and error branches', url: null },
];

export const GOALS: GoalPeriod[] = [
  { id: 'g1', tier: 'year', title: '2026 | The book, and BTB as the firm', periodStart: '2026-01-01', periodEnd: '2026-12-31', progress: 72 },
  { id: 'g2', tier: 'quarter', title: '2026 Q3 | Book draft + BTB site live', periodStart: '2026-07-01', periodEnd: '2026-09-30', progress: 80 },
  { id: 'g3', tier: 'week', title: 'Week 38 | Chapter 9 + the ROOTS one-pager', periodStart: '2026-09-14', periodEnd: '2026-09-20', progress: 55 },
];

/**
 * The attention list on the Command Center.
 *
 * Ordered by weight, highest first — editorial judgement about what costs most
 * if it waits, not a priority field. Client-derived signals never appear here:
 * they surface inside the Clients zone, from the live Notion read.
 */
export const SIGNALS: Signal[] = [
  { id: 's1', title: 'Chapter 9 is the only thing between you and the draft', detail: 'Due 30 Sep. Everything else on the book is waiting behind it.', domain: 'giulia-may', href: '/d/giulia-may/book', weight: 90, kind: 'blocked' },
  { id: 's2', title: 'One LinkedIn post needs approving', detail: '"The community that quietly died" goes out today.', domain: 'content', href: '/d/content/today', weight: 80, kind: 'blocked' },
  { id: 's3', title: 'September invoices not chased', detail: 'Due tomorrow. Admin & Business.', domain: 'accountancy', href: '/d/accountancy/invoices', weight: 70, kind: 'money' },
  { id: 's4', title: 'Big Tribe Builders Brain is not authorised', detail: 'Voice and story retrieval is offline until it is connected.', domain: 'brain', href: '/d/brain/sources', weight: 60, kind: 'blocked' },
  { id: 's5', title: 'Client work is not connected yet', detail: 'The Clients zone reads Notion at request time. NOTION_TOKEN is not set.', domain: 'clients', href: '/d/clients/active', weight: 50, kind: 'waiting' },
];
