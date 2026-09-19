import {
  getTasks, getApps, getBrainSources, getVoiceRules,
  getContent, getCourses, getGoals, getSignals,
} from '@/lib/data';
import { readClients, readClientTasks } from '@/lib/notion';
import type {
  Client, Task, AppLink, BrainSource, VoiceRule,
  ContentItem, Course, GoalPeriod, Signal,
} from '@/lib/types';

/**
 * Every domain page reads the same bundle.
 *
 * One round trip's worth of reads, in parallel, which keeps the view
 * functions pure: they receive data, they return JSX, they never fetch.
 *
 * Note the asymmetry, and keep it. Everything reachable from `getX()` may be
 * persisted in Supabase. `clients` and `clientTasks` come from Notion at
 * request time and are held only for the length of this render.
 */
export type Bundle = {
  tasks: Task[];
  apps: AppLink[];
  brainSources: BrainSource[];
  voiceRules: VoiceRule[];
  content: ContentItem[];
  courses: Course[];
  goals: GoalPeriod[];
  signals: Signal[];
  source: 'supabase' | 'seed';
  error: string | null;

  /** Live from Notion. Never stored, never cached, never committed. */
  clients: Client[];
  clientTasks: Task[];
  clientsConnected: boolean;
};

export async function loadAll(): Promise<Bundle> {
  const [
    tasks, apps, brainSources, voiceRules,
    content, courses, goals, signals,
    clients, clientTasks,
  ] = await Promise.all([
    getTasks(), getApps(), getBrainSources(), getVoiceRules(),
    getContent(), getCourses(), getGoals(), getSignals(),
    readClients(), readClientTasks(),
  ]);

  // If any read fell back, say so once rather than ten times.
  const failed = [tasks, apps, brainSources, voiceRules, content, courses, goals, signals]
    .find((r) => r.error);

  return {
    tasks: tasks.rows,
    apps: apps.rows,
    brainSources: brainSources.rows,
    voiceRules: voiceRules.rows,
    content: content.rows,
    courses: courses.rows,
    goals: goals.rows,
    signals: signals.rows,
    source: tasks.source,
    error: failed?.error ?? null,

    clients: clients.rows,
    clientTasks: clientTasks.rows,
    clientsConnected: clients.connected,
  };
}
