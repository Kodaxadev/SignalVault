import type { FrontierSystemIntelSummary } from './frontierStaticTypes';

export function FrontierStaticSiteIntelPanel({
  intel,
  status,
}: {
  intel?: FrontierSystemIntelSummary | null;
  status: 'pending' | 'success' | 'error';
}) {
  if (status === 'pending') {
    return (
      <section className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">STATIC SITE INTEL</h3>
        <p className="mt-1 text-xs text-gray-500">Loading Frontier static index...</p>
      </section>
    );
  }

  if (status === 'error' || !intel) {
    return (
      <section className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">STATIC SITE INTEL</h3>
        <p className="mt-1 text-xs text-gray-500">
          Static site data unavailable. Deploy the compact Frontier index to enable this panel.
        </p>
      </section>
    );
  }

  const tags = intel.tags.slice(0, 6).map(formatTag);
  const ecosystems = intel.ecosystemNames.slice(0, 3);

  return (
    <section className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">STATIC SITE INTEL</h3>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <Metric label="Sites" value={intel.siteCount} suffix="sites" />
        <Metric label="Belts" value={intel.beltGroups} suffix="belts" />
        <Metric label="Trojans" value={intel.trojanGroups} suffix="trojans" />
        <Metric label="Danger" value={intel.dangerTaggedGroups} suffix="danger groups" />
      </dl>
      {ecosystems.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          Ecosystems: <span className="text-gray-300">{ecosystems.join(', ')}</span>
        </p>
      )}
      {tags.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Tags: <span className="text-gray-400">{tags.join(', ')}</span>
        </p>
      )}
    </section>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-mono text-gray-200">{value.toLocaleString()} {suffix}</dd>
    </div>
  );
}

function formatTag(tag: string) {
  return tag.replace(/_/g, ' ');
}
