import OpenAI from 'openai';
import { OPENAI_MODEL } from './constants';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface WolfArchetype {
  archetypeName: string;
  personality: string;
  originStory: string;
  motto: string;
  rarity: string;
  seed: string;
}

const SYSTEM_PROMPT = `You are the Wolf Oracle. Given a person's quiz answers about their personality, you generate a unique wolf archetype. You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no extra text). The JSON must have exactly these keys:
- "archetypeName": a creative wolf archetype name (2-4 words)
- "personality": a brief personality description (1-2 sentences)
- "originStory": a short mythical origin story (2-3 sentences)
- "motto": a wolf motto/creed (1 sentence)
- "rarity": must be exactly the rarity value provided in the user message
- "seed": must be exactly the seed value provided in the user message

Example input: {"answers":{"danger":"fight","terrain":"snowy mountain","night":"powerful","role":"leader","element":"fire"},"rarity":"common","seed":"abc123"}
Example output: {"archetypeName":"Blazing Alpha","personality":"A fierce and commanding presence who leads with unwavering courage and burning determination.","originStory":"Born in the volcanic peaks where snow meets magma, the Blazing Alpha emerged from the clash of ice and fire. Tempered by extremes, this wolf learned that true strength comes from embracing contradiction.","motto":"Through fire and frost, I lead the way.","rarity":"common","seed":"abc123"}

Example input: {"answers":{"danger":"observe","terrain":"misty valley","night":"curious","role":"scout","element":"shadow"},"rarity":"rare","seed":"def456"}
Example output: {"archetypeName":"Silent Mist Walker","personality":"An enigmatic observer who moves unseen through fog and shadow, gathering secrets the world has forgotten.","originStory":"In the deepest valley where mist never lifts, a lone wolf learned to read the whispers of shadows. The Silent Mist Walker became one with the fog, seeing what others cannot.","motto":"In silence, all truths reveal themselves.","rarity":"rare","seed":"def456"}`;

function buildUserPrompt(
  answers: Record<string, string>,
  rarity: string,
  seed: string
): string {
  return JSON.stringify({ answers, rarity, seed });
}

export function parseWolfJSON(raw: string): WolfArchetype | null {
  // Direct parse
  try {
    const parsed = JSON.parse(raw);
    if (isValidWolf(parsed)) return parsed;
  } catch { /* fallthrough */ }

  // Rescue: extract JSON substring from surrounding text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (isValidWolf(parsed)) return parsed;
    } catch { /* fallthrough */ }
  }

  return null;
}

function isValidWolf(obj: unknown): obj is WolfArchetype {
  if (!obj || typeof obj !== 'object') return false;
  const w = obj as Record<string, unknown>;
  return (
    typeof w.archetypeName === 'string' &&
    typeof w.personality === 'string' &&
    typeof w.originStory === 'string' &&
    typeof w.motto === 'string' &&
    typeof w.rarity === 'string' &&
    typeof w.seed === 'string'
  );
}

export async function generateWolfArchetype(
  answers: Record<string, string>,
  rarity: string,
  seed: string
): Promise<{
  archetype: WolfArchetype;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}> {
  const userPrompt = buildUserPrompt(answers, rarity, seed);

  // First attempt
  let result = await callOpenAI(userPrompt);
  let parsed = parseWolfJSON(result.content);
  if (parsed) return { archetype: parsed, usage: result.usage };

  // Retry once with reminder
  console.warn('First OpenAI parse failed, retrying…');
  const retryPrompt =
    userPrompt + '\nReminder: respond with ONLY valid JSON, no other text.';
  result = await callOpenAI(retryPrompt);
  parsed = parseWolfJSON(result.content);
  if (parsed) return { archetype: parsed, usage: result.usage };

  throw new Error('Failed to parse wolf archetype from OpenAI after retry');
}

async function callOpenAI(
  userPrompt: string
): Promise<{
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    return { content, usage };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status: number }).status === 429
    ) {
      throw new Error(
        'OpenAI rate limit reached. Please try again in a few seconds.'
      );
    }
    throw error;
  }
}
