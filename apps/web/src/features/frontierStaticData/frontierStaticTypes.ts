export type FrontierStaticEcosystem = {
  id: string;
  name: string;
  description: string;
  entryDungeonId: number | null;
  naturalPatternCount: number;
  brokenPatternCount: number;
};

export type FrontierSystemStaticIntel = {
  siteCount: number;
  beltGroups: number;
  trojanGroups: number;
  dangerTaggedGroups: number;
  ecosystemIds: string[];
  tags: string[];
};

export type FrontierStaticIndex = {
  schemaVersion: 1;
  generatedAt: string;
  source: {
    ecosystem: string;
    landscape: string;
    provenance: string;
  };
  stats: {
    ecosystemCount: number;
    systemCount: number;
    beltGroupCount: number;
    trojanGroupCount: number;
    siteCount: number;
    missingEcosystemRefs: number;
    topTags: [string, number][];
    topEcosystems: Array<{ id: string; count: number; name: string }>;
  };
  ecosystems: Record<string, FrontierStaticEcosystem>;
  systems: Record<string, FrontierSystemStaticIntel>;
};

export type FrontierSystemIntelSummary = FrontierSystemStaticIntel & {
  ecosystemNames: string[];
};
