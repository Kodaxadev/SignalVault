import type { EntityType } from '@/features/entities';
import type { QuickSignalAction } from '@/features/signals/quickActionTypes';

const ALL_ACTIONS: QuickSignalAction[] = [
  // unknown
  { id: 'field_note', label: 'Log Field Signal', entityTypes: ['unknown'], signalType: 'field_note', defaultConfidence: 'observed' },
  // smart_gate
  { id: 'passed', label: 'Passed', entityTypes: ['smart_gate'], signalType: 'gate_recon', defaultConfidence: 'observed' },
  { id: 'blocked', label: 'Blocked', entityTypes: ['smart_gate'], signalType: 'access_denied', defaultConfidence: 'observed' },
  { id: 'permit', label: 'Permit Required', entityTypes: ['smart_gate'], signalType: 'permit_report', defaultConfidence: 'observed' },
  { id: 'hostile', label: 'Hostile Nearby', entityTypes: ['smart_gate'], signalType: 'hostile_contact', defaultConfidence: 'observed' },
  // smart_storage_unit
  { id: 'access_worked', label: 'Access Worked', entityTypes: ['smart_storage_unit'], signalType: 'storage_manifest', defaultConfidence: 'observed' },
  { id: 'access_denied', label: 'Access Denied', entityTypes: ['smart_storage_unit'], signalType: 'access_denied', defaultConfidence: 'observed' },
  { id: 'mark_empty', label: 'Mark Empty', entityTypes: ['smart_storage_unit'], signalType: 'storage_manifest', defaultConfidence: 'observed' },
  { id: 'mark_stale', label: 'Mark Stale', entityTypes: ['smart_storage_unit'], signalType: 'storage_manifest', defaultConfidence: 'stale' },
  // system
  { id: 'hostile_system', label: 'Hostile System', entityTypes: ['system'], signalType: 'system_report', defaultConfidence: 'observed' },
  { id: 'resource_found', label: 'Resource Found', entityTypes: ['system'], signalType: 'resource_report', defaultConfidence: 'observed' },
  // route
  { id: 'route_safe', label: 'Route Safe', entityTypes: ['route'], signalType: 'route_report', defaultConfidence: 'observed' },
  { id: 'route_unsafe', label: 'Route Unsafe', entityTypes: ['route'], signalType: 'route_report', defaultConfidence: 'observed' },
  { id: 're_scout', label: 'Re-Scout Needed', entityTypes: ['route'], signalType: 'route_report', defaultConfidence: 'stale' },
  { id: 'blocked_hop', label: 'Blocked Hop', entityTypes: ['route'], signalType: 'route_report', defaultConfidence: 'observed' },
  // market
  { id: 'market_open', label: 'Market Open', entityTypes: ['market'], signalType: 'market_report', defaultConfidence: 'observed' },
  { id: 'market_closed', label: 'Market Closed', entityTypes: ['market'], signalType: 'market_report', defaultConfidence: 'observed' },
  { id: 'poor_liquidity', label: 'Poor Liquidity', entityTypes: ['market'], signalType: 'market_report', defaultConfidence: 'observed' },
  { id: 'good_trade', label: 'Good Trade Point', entityTypes: ['market'], signalType: 'market_report', defaultConfidence: 'observed' },
  { id: 'hostile_hub', label: 'Hostile Trade Hub', entityTypes: ['market'], signalType: 'market_report', defaultConfidence: 'observed' },
];

export function getActionsForType(entityType: EntityType): QuickSignalAction[] {
  return ALL_ACTIONS.filter((a) => a.entityTypes.includes(entityType));
}

export function getActionById(id: string): QuickSignalAction | undefined {
  return ALL_ACTIONS.find((a) => a.id === id);
}
