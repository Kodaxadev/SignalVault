// Read once at import time. Restart the server to pick up env changes.
export const suiEnv = {
  /** Confirmed Stillness Sui GraphQL endpoint (public Sui testnet). */
  suiGraphqlUrl:
    process.env['SUI_GRAPHQL_URL'] ?? 'https://graphql.testnet.sui.io/graphql',
  /** Must be true for the server to attempt Sui character resolution on push. */
  enableSuiCharacterResolution:
    process.env['ENABLE_SUI_CHARACTER_RESOLUTION'] === 'true',
} as const;
