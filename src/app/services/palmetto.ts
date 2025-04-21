const PALMETTO_BASE_URL = 'https://ei.palmetto.com/api/v0';

export async function checkHealth() {
  const response = await fetch(`${PALMETTO_BASE_URL}/health`, {
    headers: {
      'Authorization': `Bearer ${process.env.PALMETTO_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Palmetto health check failed: ${response.statusText}`);
  }

  return response.json();
} 