export interface SuiGraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

/**
 * Posts a GraphQL query to the Sui node and returns the parsed response.
 * Throws on network failure or non-2xx HTTP status.
 * Callers must check `response.errors` for GraphQL-level errors.
 */
export async function suiGraphqlQuery<T>(
  endpoint: string,
  query: string
): Promise<SuiGraphqlResponse<T>> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
  } catch (err) {
    throw new Error(`Sui GraphQL network error: ${String(err)}`);
  }

  if (!res.ok) {
    throw new Error(`Sui GraphQL HTTP ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<SuiGraphqlResponse<T>>;
}
