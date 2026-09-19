import type { BrainSource, VoiceRule } from '@/lib/types';

/**
 * The intelligence layer.
 *
 * No client is named in this file. Sources that reach client data describe
 * the reach, not the clients.
 *
 * Sources are what the dashboard can read. Voice rules are what it must obey
 * when it writes. Together they are the difference between "an AI wrote this"
 * and "Giulia wrote this".
 */
export const BRAIN_SOURCES: BrainSource[] = [
  {
    id: 'btb-brain',
    name: 'Big Tribe Builders Brain',
    kind: 'graph',
    state: 'needs_auth',
    reach: '22k chunks · 19k nodes · the 15-chapter book',
    feeds: ['content', 'big-tribe-builders', 'giulia-may', 'brain'],
    note: 'The GraphRAG corpus behind your voice and stories. Needs authorising once in an interactive session before this dashboard can read it.',
  },
  {
    id: 'btb-team-memory',
    name: 'BTB Team Memory',
    kind: 'mcp',
    state: 'connected',
    reach: 'Agency decisions and ways of working',
    feeds: ['apps', 'big-tribe-builders'],
    note: 'Shared memory bank across the team. Decisions of record live here.',
  },
  {
    id: 'notion-brain',
    name: 'Notion',
    kind: 'database',
    state: 'connected',
    reach: 'GN_tasks · Goal Navigator · the client zone, read live',
    feeds: ['studying', 'fitness', 'accountancy'],
    note: 'The system of record. Her own work is mirrored here; client work is read at request time and never stored.',
  },
  {
    id: 'upwork-mcp',
    name: 'Upwork',
    kind: 'mcp',
    state: 'connected',
    reach: 'Jobs, proposals, contracts, offers, financials',
    feeds: ['upwork'],
    note: null,
  },
  {
    id: 'google-mcp',
    name: 'Google Workspace',
    kind: 'mcp',
    state: 'connected',
    reach: 'Gmail · Calendar · Drive',
    feeds: ['content', 'accountancy'],
    note: null,
  },
  {
    id: 'kit-mcp',
    name: 'Kit',
    kind: 'mcp',
    state: 'connected',
    reach: 'Subscribers, broadcasts, sequences, stats',
    feeds: ['content', 'giulia-may'],
    note: null,
  },
  {
    id: 'spi-corpus',
    name: 'SPI Academy lessons',
    kind: 'corpus',
    state: 'planned',
    reach: 'Course notes and transcripts',
    feeds: ['studying', 'content'],
    note: 'Not yet ingested. Once in, lessons can be cited directly in drafts.',
  },
  {
    id: 'books-corpus',
    name: 'Business library',
    kind: 'corpus',
    state: 'planned',
    reach: 'The books you actually run your business on',
    feeds: ['brain', 'content', 'big-tribe-builders'],
    note: 'StoryBrand, Aaron Dignan, Wes McDowell and the rest — as retrievable text, not a reading list.',
  },
];

/**
 * Lifted from the voice work already done in the BTB brain (brand sheet Topic 5).
 * These are written as rules a checker can apply, not as adjectives.
 */
export const VOICE_RULES: VoiceRule[] = [
  { id: 'v1', kind: 'principle', title: 'Start mid-thought', detail: 'Open with "So…" — as if continuing a conversation already in progress. Never open with a throat-clear.' },
  { id: 'v2', kind: 'principle', title: 'Talk to one person', detail: '"You guys", "be welcome", "just hop in". Second person, singular in feeling even when plural in words.' },
  { id: 'v3', kind: 'principle', title: 'Lead with a metaphor', detail: 'You think in images. The house, the village, the octopus with eight brains. A paragraph without an image is a paragraph to rewrite.' },
  { id: 'v4', kind: 'principle', title: 'Normalise the struggle', detail: '"I don\'t want you to be disappointed", "rest assured", "it\'s all good". Remove shame before giving instruction.' },
  { id: 'v5', kind: 'principle', title: 'Magical, but grounded in systems', detail: 'The aliveness AND the backbone. Optimism that can point at a structure.' },
  { id: 'v6', kind: 'principle', title: 'Warm and unguarded', detail: '"I so appreciate you", "super fun", "beautiful and amazing people". Effusive is on-brand; corporate is not.' },

  { id: 'l1', kind: 'lexicon', title: 'Signature words', detail: 'tribe · the house · behind closed doors · the village · journey · building blocks · backbone · pillars · container · the magic · the secret sauce · aliveness · thriving · vibrant · knowledge vault · playground · baby steps · noise · the dip · 360 view' },
  { id: 'l2', kind: 'lexicon', title: 'Core concepts', detail: 'purpose · culture · connection · belonging · experience · onboarding · the host role · show up · co-creation' },
  { id: 'l3', kind: 'lexicon', title: 'Locked phrases', detail: '"Build big. Stay human." · "from asset to feeling" · "a home behind closed doors" · "architect and alchemist" · "you stay rare, your members feel home"' },

  { id: 'a1', kind: 'avoid', title: 'Never corporate-speak', detail: 'No "leverage", "synergy", "solutions", "deliverables" in outward copy.' },
  { id: 'a2', kind: 'avoid', title: 'Never guru hype', detail: 'No "2 clicks", no "10x", no fake urgency, no hustle framing.' },
  { id: 'a3', kind: 'avoid', title: 'Never imply it is easy', detail: 'Nothing that shames a reader for finding community building hard. It is hard. Say so.' },
  { id: 'a4', kind: 'avoid', title: 'Never overpromise the team', detail: 'BTB is you and your son. No "big team", no "we launch and grow it for you". Elite advisory: you make the plan, they implement.' },
  { id: 'a5', kind: 'avoid', title: 'No jargon without an image', detail: 'If a term cannot be paired with a picture, it does not go in.' },

  { id: 's1', kind: 'story', title: 'The first community', detail: 'Nobody came. The origin of everything you now teach about the container.' },
  { id: 's2', kind: 'story', title: 'Green Exam Academy', detail: 'The proof story — where the method first worked at scale.' },
  { id: 's3', kind: 'story', title: 'Launched on my father\'s birthday', detail: 'The personal anchor. Use sparingly, never as a device.' },
  { id: 's4', kind: 'story', title: 'The client transformations', detail: 'Three engagements, each a different shape of change. Names come from the client zone when a story is actually being written — never from here.' },
];
