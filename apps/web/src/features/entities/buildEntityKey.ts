export function buildEntityKey(input: {
  tenant?: string;
  itemId?: string;
  objectId?: string;
  label?: string;
}): string {
  if (input.objectId) {
    return `object:${input.tenant ?? 'unknown'}:${input.objectId}`;
  }
  if (input.itemId) {
    return `item:${input.tenant ?? 'unknown'}:${input.itemId}`;
  }
  if (input.label) {
    return `label:${input.label.toLowerCase()}`;
  }
  return 'unknown';
}
