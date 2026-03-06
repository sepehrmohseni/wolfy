import { parseWolfJSON } from '../lib/openai';

describe('parseWolfJSON', () => {
  // Example successful response
  const validJSON =
    '{"archetypeName":"Blazing Alpha","personality":"A fierce and commanding presence who leads with unwavering courage.","originStory":"Born in the volcanic peaks where snow meets magma, the Blazing Alpha emerged from the clash of ice and fire. Tempered by extremes, this wolf learned that true strength comes from embracing contradiction.","motto":"Through fire and frost, I lead the way.","rarity":"common","seed":"abc123def456"}';

  // Example successful response #2
  const validJSON2 =
    '{"archetypeName":"Silent Mist Walker","personality":"An enigmatic observer who moves unseen through fog and shadow.","originStory":"In the deepest valley where mist never lifts, a lone wolf learned to read the whispers of shadows. The Silent Mist Walker became one with the fog, seeing what others cannot.","motto":"In silence, all truths reveal themselves.","rarity":"rare","seed":"def456abc789"}';

  // Example malformed response (OpenAI added extra text)
  const malformedResponse = `Here is your wolf archetype:
\`\`\`json
{"archetypeName":"Shadow Stalker","personality":"Silent and deadly, this wolf moves through darkness unseen.","originStory":"Emerged from the void between stars, the Shadow Stalker learned that darkness is not emptiness but fullness. In shadow, all possibilities exist.","motto":"In shadows we trust.","rarity":"rare","seed":"aaa111bbb222"}
\`\`\`
Enjoy your wolf!`;

  it('parses valid JSON directly', () => {
    const result = parseWolfJSON(validJSON);
    expect(result).not.toBeNull();
    expect(result!.archetypeName).toBe('Blazing Alpha');
    expect(result!.rarity).toBe('common');
    expect(result!.seed).toBe('abc123def456');
  });

  it('parses second valid example', () => {
    const result = parseWolfJSON(validJSON2);
    expect(result).not.toBeNull();
    expect(result!.archetypeName).toBe('Silent Mist Walker');
    expect(result!.rarity).toBe('rare');
  });

  it('extracts JSON from malformed response with extra text', () => {
    const result = parseWolfJSON(malformedResponse);
    expect(result).not.toBeNull();
    expect(result!.archetypeName).toBe('Shadow Stalker');
    expect(result!.rarity).toBe('rare');
    expect(result!.seed).toBe('aaa111bbb222');
  });

  it('returns null for completely invalid input', () => {
    const result = parseWolfJSON(
      'This is not JSON at all, just random text about wolves and forests.'
    );
    expect(result).toBeNull();
  });

  it('returns null for JSON missing required keys', () => {
    const result = parseWolfJSON('{"name":"Wolf","type":"animal"}');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseWolfJSON('')).toBeNull();
  });
});
