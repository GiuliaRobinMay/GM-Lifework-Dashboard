/**
 * The domain model.
 *
 * These types are the contract between the Supabase tables
 * (supabase/migrations/0001_init.sql) and the UI. The seed data in
 * src/lib/seed satisfies exactly the same types, which is what lets the
 * dashboard run with or without a database behind it.
 */

export type ClientStatus = 'active' | 'contact' | 'done' | 'sleeping' | 'archived';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

/** Mirrors the `area` field on GN_tasks in the Goal Navigator. */
export type LifeArea =
  | 'Clients' | 'Sales' | 'Admin & Business'
  | 'Personal Development' | 'Sports' | 'Personal';

export type TaskStatus = 'inbox' | 'next' | 'in_progress' | 'waiting_on' | 'someday' | 'done';

export type Client = {
  id: string;
  /** The community name — this is the title in Notion and what she says out loud. */
  community: string;
  /** The person. May be empty; never rely on it alone to identify a row. */
  contact: string | null;
  status: ClientStatus;
  /** Which venture owns the relationship. */
  venture: 'btb' | 'quinb' | 'direct';
  notionUrl: string | null;
  /** The community platform, where one is known. */
  platform: string | null;
  /** Set when a live MCP server can read this community's data. */
  mcpServer: string | null;
  /** Where they sit in ROOTS, for active engagements. */
  rootsPhase: RootsPhase | null;
  openTasks: number;
  lastTouch: string | null;
  notes: string | null;
};

export type RootsPhase = 'root' | 'orchestrate' | 'optimize' | 'tribe' | 'systemize';

export const ROOTS: { key: RootsPhase; letter: string; name: string; blurb: string }[] = [
  { key: 'root', letter: 'R', name: 'Root the Architecture', blurb: 'Spaces, structure and the container itself.' },
  { key: 'orchestrate', letter: 'O', name: 'Orchestrate the Experience', blurb: 'Onboarding, rituals and the member journey.' },
  { key: 'optimize', letter: 'O', name: 'Optimize the Offer', blurb: 'What they sell, and why it converts.' },
  { key: 'tribe', letter: 'T', name: 'Tribe-Build the Audience', blurb: 'Acquisition, and turning audience into members.' },
  { key: 'systemize', letter: 'S', name: 'Systemize the Intelligence', blurb: 'Automations, data and the team that runs it.' },
];

export type Task = {
  id: string;
  title: string;
  /** Which Notion database this came from. */
  source: 'daily_tasks' | 'gn_tasks';
  clientId: string | null;
  clientName: string | null;
  area: LifeArea | null;
  status: TaskStatus;
  priority: Priority | null;
  dueDate: string | null;
  doDate: string | null;
  /** The domain this task belongs on in the dashboard. */
  domain: string;
};

/** An external app. The dashboard links out to these; it never rebuilds them. */
export type AppLink = {
  id: string;
  name: string;
  url: string;
  /** What it is for, in four words. */
  note: string;
  category: AppCategory;
  /** Domains where this link should surface. Empty = only in the Launchpad. */
  domains: string[];
  /** True when this tool also has an MCP server wired into the brain. */
  connected: boolean;
  pinned: boolean;
};

export type AppCategory =
  | 'Communities' | 'Work & Delivery' | 'Content & Social'
  | 'Email & Audience' | 'Build & Deploy' | 'Money' | 'Learning' | 'Personal';

/** A connected intelligence source — an MCP server, a graph, a corpus. */
export type BrainSource = {
  id: string;
  name: string;
  kind: 'mcp' | 'graph' | 'corpus' | 'database';
  /** Live, needs authorising, or planned. */
  state: 'connected' | 'needs_auth' | 'planned';
  reach: string;
  /** Which dashboard domains this source feeds. */
  feeds: string[];
  note: string | null;
};

/** One rule in the voice guide. Drafts are checked against these. */
export type VoiceRule = {
  id: string;
  kind: 'principle' | 'lexicon' | 'avoid' | 'story';
  title: string;
  detail: string;
};

export type ContentItem = {
  id: string;
  title: string;
  channel: 'LinkedIn' | 'Newsletter' | 'YouTube' | 'Instagram' | 'Podcast' | 'Blog';
  state: 'idea' | 'drafting' | 'review' | 'scheduled' | 'published';
  scheduledFor: string | null;
  campaign: string | null;
  /** Which venture this post is for. */
  venture: 'btb' | 'quinb' | 'giulia-may';
};

/**
 * There is deliberately no Deployment type and no deployments table.
 *
 * Every deployment she is responsible for belongs to a client, and its name,
 * its host and its URL each identify that client. Deployment state is read in
 * the Clients zone, from the client's own record, or not at all.
 */

export type Course = {
  id: string;
  title: string;
  provider: string;
  lessonsTotal: number;
  lessonsDone: number;
  state: 'to_study' | 'studying' | 'done';
  nextLesson: string | null;
  url: string | null;
};

/** The Goal Navigator ladder: year -> quarter -> week. One theme per period. */
export type GoalPeriod = {
  id: string;
  tier: 'year' | 'quarter' | 'week';
  title: string;
  periodStart: string;
  periodEnd: string;
  progress: number | null;
};

/** A single line on the Command Center's attention list. */
export type Signal = {
  id: string;
  title: string;
  detail: string;
  domain: string;
  href: string;
  /** Drives ordering, not colour. */
  weight: number;
  kind: 'blocked' | 'overdue' | 'waiting' | 'money' | 'live';
};
