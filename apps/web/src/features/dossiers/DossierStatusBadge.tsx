type StatusVariant =
  | 'green' | 'amber' | 'red' | 'black' | 'ghost' | 'unknown'
  | 'open' | 'blocked' | 'permit_suspected' | 'toll_suspected'
  | 'current' | 'stale' | 'empty'
  | 'closed' | 'poor_liquidity' | 'good_trade' | 'hostile'
  | 'worked' | 'denied';

const variantColors: Record<StatusVariant, string> = {
  green: 'bg-green-900 text-green-300',
  amber: 'bg-yellow-900 text-yellow-300',
  red: 'bg-red-900 text-red-300',
  black: 'bg-gray-900 text-gray-400',
  ghost: 'bg-gray-800 text-gray-500',
  unknown: 'bg-gray-700 text-gray-400',
  open: 'bg-green-900 text-green-300',
  blocked: 'bg-red-900 text-red-300',
  permit_suspected: 'bg-yellow-900 text-yellow-300',
  toll_suspected: 'bg-yellow-900 text-yellow-300',
  current: 'bg-emerald-900 text-emerald-300',
  stale: 'bg-orange-900 text-orange-300',
  empty: 'bg-gray-800 text-gray-400',
  closed: 'bg-red-900 text-red-300',
  poor_liquidity: 'bg-orange-900 text-orange-300',
  good_trade: 'bg-green-900 text-green-300',
  hostile: 'bg-red-900 text-red-300',
  worked: 'bg-green-900 text-green-300',
  denied: 'bg-red-900 text-red-300',
};

const variantLabels: Record<StatusVariant, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
  black: 'Black',
  ghost: 'Ghost',
  unknown: 'Unknown',
  open: 'Open',
  blocked: 'Blocked',
  permit_suspected: 'Permit Suspected',
  toll_suspected: 'Toll Suspected',
  current: 'Current',
  stale: 'Stale',
  empty: 'Empty',
  closed: 'Closed',
  poor_liquidity: 'Poor Liquidity',
  good_trade: 'Good Trade',
  hostile: 'Hostile',
  worked: 'Worked',
  denied: 'Denied',
};

export function DossierStatusBadge({
  variant,
  label,
}: {
  variant: StatusVariant;
  label?: string;
}) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${variantColors[variant]}`}>
      {label ?? variantLabels[variant]}
    </span>
  );
}
