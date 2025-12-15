export interface EmbeddingResult {
  embedding: number[];
  index: number;
}

export async function createEmbeddings(
  inputs: string[],
  openaiApiKey: string,
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResult[]> {
  if (!inputs.length) return [];

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model,
      input: inputs
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return (data.data as any[]).map(item => ({
    embedding: item.embedding as number[],
    index: item.index as number
  }));
}

