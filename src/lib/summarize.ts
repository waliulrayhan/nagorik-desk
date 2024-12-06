export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await fetch('https://api.apyhub.com/ai/summarize-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apy-token': process.env.APY_HUB_TOKEN!
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Failed to summarize text');
    }

    const data = await response.json();
    return data.summary || text;
  } catch (error) {
    console.error('Text summarization failed:', error);
    return text; // Return original text if summarization fails
  }
} 