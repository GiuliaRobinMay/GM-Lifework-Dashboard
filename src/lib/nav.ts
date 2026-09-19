/**
 * The information architecture.
 *
 * Two rules decide everything here:
 *
 *   1. The left rail is WHERE you are. It is stable, it never reorders, and
 *      you learn it once. Twelve destinations in five groups.
 *   2. The tab strip is WHAT you are looking at inside that place. Maximum
 *      five tabs, and there is no level below it. If something needs a third
 *      level, it is its own domain or it is a link out.
 *
 * Anything that would be a fourth click is instead reachable from the command
 * palette (cmd-K) or the pin rail.
 */

export type IconName =
  | 'home' | 'tribe' | 'academy' | 'star' | 'users' | 'briefcase'
  | 'rocket' | 'megaphone' | 'brain' | 'book' | 'heart' | 'coins'
  | 'grid' | 'settings';

export type Tab = {
  slug: string;
  label: string;
  /** One line explaining what this zone is for. Shown under the page title. */
  blurb: string;
};

export type Domain = {
  slug: string;
  label: string;
  /** Sidebar group heading. */
  group: DomainGroup;
  icon: IconName;
  /** Rotates violet -> red -> green -> orange. Decoration only, never meaning. */
  accent: Accent;
  /** Shown as the page subtitle on the domain's own page. */
  blurb: string;
  tabs: Tab[];
};

export type Accent = 'violet' | 'red' | 'green' | 'orange';
export type DomainGroup = 'Ventures' | 'Work' | 'Intelligence' | 'Life';

export const GROUP_ORDER: DomainGroup[] = ['Ventures', 'Work', 'Intelligence', 'Life'];

/** Rotate the four so no two neighbours in a list ever match. */
export function accentAt(index: number): Accent {
  return (['violet', 'red', 'green', 'orange'] as const)[index % 4];
}

export const DOMAINS: Domain[] = [
  // ---------------------------------------------------------------- Ventures
  {
    slug: 'big-tribe-builders',
    label: 'Big Tribe Builders',
    group: 'Ventures',
    icon: 'tribe',
    accent: 'violet',
    blurb: 'Elite advisory for communities at scale. Build big. Stay human.',
    tabs: [
      { slug: 'pulse', label: 'Pulse', blurb: 'What moved this week across every engagement.' },
      { slug: 'engagements', label: 'Engagements', blurb: 'Live advisory work, by client and by ROOTS phase.' },
      { slug: 'roots', label: 'ROOTS', blurb: 'The five-pillar method, and where each client sits in it.' },
      { slug: 'pipeline', label: 'Pipeline', blurb: 'Calls booked, proposals out, and who to chase.' },
      { slug: 'assets', label: 'Assets', blurb: 'Decks, blueprints, playbooks and the reusable library.' },
    ],
  },
  {
    slug: 'quinb-academy',
    label: 'QuinB Academy',
    group: 'Ventures',
    icon: 'academy',
    accent: 'red',
    blurb: "A host's home base — resources, live meetups, and the peer room of outstanding hosts.",
    tabs: [
      { slug: 'pulse', label: 'Pulse', blurb: 'Members, energy and what needs a host right now.' },
      { slug: 'members', label: 'Members', blurb: 'Joins, activations and the ones going quiet.' },
      { slug: 'programme', label: 'Programme', blurb: 'Courses, live meetups and the calendar ahead.' },
      { slug: 'team', label: 'Team', blurb: 'Hosts, moderators and who owns which space.' },
      { slug: 'revenue', label: 'Revenue', blurb: 'Subscriptions, churn and the money picture.' },
    ],
  },
  {
    slug: 'giulia-may',
    label: 'Giulia May',
    group: 'Ventures',
    icon: 'star',
    accent: 'green',
    blurb: 'The authority hub — the book, the speaking, the public record of who you are.',
    tabs: [
      { slug: 'book', label: 'The Book', blurb: 'Fifteen chapters, and where each one stands.' },
      { slug: 'speaking', label: 'Speaking', blurb: 'Podcasts, stages and inbound invitations.' },
      { slug: 'site', label: 'Website', blurb: 'giuliamay.com — what is live and what is queued.' },
      { slug: 'list', label: 'Audience', blurb: 'Newsletter, subscribers and the free resources.' },
    ],
  },

  // -------------------------------------------------------------------- Work
  {
    slug: 'clients',
    label: 'Clients',
    group: 'Work',
    icon: 'users',
    accent: 'orange',
    blurb: 'Every community you touch, from first call to live engagement.',
    tabs: [
      { slug: 'active', label: 'Active', blurb: 'Live engagements. The ones you owe work to today.' },
      { slug: 'pipeline', label: 'Pipeline', blurb: 'Contacts and conversations that have not closed yet.' },
      { slug: 'communities', label: 'Communities', blurb: 'The platforms themselves, and which are wired to this dashboard.' },
      { slug: 'delivery', label: 'Delivery', blurb: 'Open work per client, pulled from Daily Tasks.' },
      { slug: 'archive', label: 'Archive', blurb: 'Finished and sleeping engagements, kept for reference.' },
    ],
  },
  {
    slug: 'upwork',
    label: 'Upwork',
    group: 'Work',
    icon: 'briefcase',
    accent: 'violet',
    blurb: 'Inbound work — invitations, proposals, contracts and what they pay.',
    tabs: [
      { slug: 'inbox', label: 'Inbox', blurb: 'Invitations and messages waiting on you.' },
      { slug: 'proposals', label: 'Proposals', blurb: 'Sent, viewed, and gone quiet.' },
      { slug: 'contracts', label: 'Contracts', blurb: 'Running contracts and their milestones.' },
      { slug: 'offers', label: 'Offers', blurb: 'Offers on the table, and what to answer.' },
      { slug: 'financials', label: 'Financials', blurb: 'Earnings, pending payments and connects.' },
    ],
  },
  {
    slug: 'apps',
    label: 'Apps & Deployments',
    group: 'Work',
    icon: 'rocket',
    accent: 'red',
    blurb: 'Everything you and the team have shipped, and whether it is still up.',
    tabs: [
      { slug: 'live', label: 'Live', blurb: 'What is deployed right now, and its health.' },
      { slug: 'building', label: 'Building', blurb: 'In flight — branches, worktrees and open gates.' },
      { slug: 'incidents', label: 'Incidents', blurb: 'Things that broke, or are about to.' },
      { slug: 'workers', label: 'Workers', blurb: 'Who is building what, and what is waiting on you.' },
    ],
  },
  {
    slug: 'content',
    label: 'Content & Social',
    group: 'Work',
    icon: 'megaphone',
    accent: 'green',
    blurb: 'One pipeline, every platform — written in your voice, not a generic one.',
    tabs: [
      { slug: 'today', label: 'Today', blurb: 'What goes out today, and what needs approving.' },
      { slug: 'pipeline', label: 'Pipeline', blurb: 'Idea to draft to scheduled, across all channels.' },
      { slug: 'channels', label: 'Channels', blurb: 'LinkedIn, email, YouTube — reach and cadence.' },
      { slug: 'campaigns', label: 'Campaigns', blurb: 'Multi-post arcs tied to a launch or a theme.' },
      { slug: 'voice', label: 'Voice', blurb: 'The rules every draft is checked against.' },
    ],
  },

  // ------------------------------------------------------------ Intelligence
  {
    slug: 'brain',
    label: 'The Brain',
    group: 'Intelligence',
    icon: 'brain',
    accent: 'orange',
    blurb: 'Your own intelligence — voice, method, books and sources — wired to everything else.',
    tabs: [
      { slug: 'voice', label: 'Voice', blurb: 'How you sound, in rules a machine can actually apply.' },
      { slug: 'method', label: 'Method', blurb: 'ROOTS and the frameworks you work from.' },
      { slug: 'library', label: 'Library', blurb: 'Books, transcripts and the raw material.' },
      { slug: 'sources', label: 'Sources', blurb: 'Connected servers and what each one can reach.' },
      { slug: 'prompts', label: 'Prompts', blurb: 'Saved moves you run again and again.' },
    ],
  },

  // -------------------------------------------------------------------- Life
  {
    slug: 'studying',
    label: 'Studying',
    group: 'Life',
    icon: 'book',
    accent: 'violet',
    blurb: 'SPI Academy and everything else you are actively learning.',
    tabs: [
      { slug: 'next', label: 'Next up', blurb: 'The next lesson, and the plan for this week.' },
      { slug: 'courses', label: 'Courses', blurb: 'Every course, and how far through you are.' },
      { slug: 'notes', label: 'Notes', blurb: 'What you took from it, in your words.' },
      { slug: 'apply', label: 'Apply', blurb: 'Lessons turned into actual work.' },
    ],
  },
  {
    slug: 'fitness',
    label: 'Fitness',
    group: 'Life',
    icon: 'heart',
    accent: 'red',
    blurb: 'The non-negotiable one. Sports area of the Goal Navigator.',
    tabs: [
      { slug: 'week', label: 'This week', blurb: 'Planned, done and missed.' },
      { slug: 'plan', label: 'Plan', blurb: 'The routine you are actually following.' },
      { slug: 'trend', label: 'Trend', blurb: 'Consistency over weeks, not days.' },
    ],
  },
  {
    slug: 'accountancy',
    label: 'Accountancy',
    group: 'Life',
    icon: 'coins',
    accent: 'green',
    blurb: 'Invoices out, money in, and nothing missed at quarter end.',
    tabs: [
      { slug: 'overview', label: 'Overview', blurb: 'Where the money stands this month.' },
      { slug: 'invoices', label: 'Invoices', blurb: 'Sent, paid and overdue.' },
      { slug: 'expenses', label: 'Expenses', blurb: 'Subscriptions and what they cost you a year.' },
      { slug: 'vat', label: 'VAT & filings', blurb: 'Deadlines that carry a fine.' },
    ],
  },
];

export const DOMAIN_BY_SLUG = new Map(DOMAINS.map((d) => [d.slug, d]));

export function domainsInGroup(group: DomainGroup): Domain[] {
  return DOMAINS.filter((d) => d.group === group);
}

/** The tab to land on when a domain is opened with no tab named. */
export function defaultTab(domain: Domain): Tab {
  return domain.tabs[0];
}

export function findTab(domain: Domain, slug: string | undefined): Tab {
  if (!slug) return defaultTab(domain);
  return domain.tabs.find((t) => t.slug === slug) ?? defaultTab(domain);
}

export function domainHref(domain: Domain, tab?: string): string {
  const t = tab ?? defaultTab(domain).slug;
  return `/d/${domain.slug}/${t}`;
}
