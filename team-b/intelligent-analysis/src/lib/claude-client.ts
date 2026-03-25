// Claude API wrapper — AI-powered risk scoring and natural language explanations
// STATUS: Not yet wired up. Set ANTHROPIC_API_KEY in .env.local to enable live AI analysis.
// Currently all scoring uses rule-based logic in fraud-rules.ts and risk-scorer.ts.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function scoreTransactionRisk(transaction: object): Promise<{
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  explanation: string;
}> {
  if (!ANTHROPIC_API_KEY) {
    return { riskLevel: 'Low', confidence: 50, explanation: 'Rule-based fallback (no API key configured).' };
  }

  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `You are a financial fraud analyst. Analyze this SAP B1 transaction and return a JSON object with fields: riskLevel ("Low"|"Medium"|"High"|"Critical"), confidence (0-100), explanation (1 sentence).

Transaction:
${JSON.stringify(transaction, null, 2)}

Respond with only valid JSON.`,
        }],
      }),
    });
  } catch {
    return { riskLevel: 'Low', confidence: 50, explanation: 'Network error contacting AI service.' };
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    return { riskLevel: 'Low', confidence: 50, explanation: 'Invalid response from AI service.' };
  }

  const text = data.content?.[0]?.text ?? '{}';
  try {
    return JSON.parse(text);
  } catch {
    return { riskLevel: 'Low', confidence: 50, explanation: 'Unable to parse AI response.' };
  }
}
