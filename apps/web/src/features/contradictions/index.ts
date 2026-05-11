export { type ContradictionSeverity, type ContradictionType, type Contradiction } from './contradictionTypes';
export { getContradictionsForEntity, summarizeContradictions, hasSignalType, hasTag } from './contradictionRules';
export { detectContradictions, CONTRADICTION_WINDOW_MS } from './detectContradictions';
