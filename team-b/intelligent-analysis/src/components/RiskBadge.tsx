const FLAG_TO_RISK: Record<string, { level: string; style: string }> = {
  duplicate_payment:     { level: 'High',     style: 'bg-orange-100 text-orange-800 border-orange-200' },
  ghost_vendor:          { level: 'Critical', style: 'bg-red-100 text-red-800 border-red-200' },
  split_transaction:     { level: 'High',     style: 'bg-orange-100 text-orange-800 border-orange-200' },
  after_hours:           { level: 'Medium',   style: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  round_number:          { level: 'Medium',   style: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  bank_account_change:   { level: 'Critical', style: 'bg-red-100 text-red-800 border-red-200' },
  gl_mismatch:           { level: 'High',     style: 'bg-orange-100 text-orange-800 border-orange-200' },
  Critical:              { level: 'Critical', style: 'bg-red-100 text-red-800 border-red-200' },
  High:                  { level: 'High',     style: 'bg-orange-100 text-orange-800 border-orange-200' },
  Medium:                { level: 'Medium',   style: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  Low:                   { level: 'Low',      style: 'bg-green-100 text-green-800 border-green-200' },
};

interface RiskBadgeProps {
  flags?: string[];
}

export function RiskBadge({ flags }: RiskBadgeProps) {
  if (!flags || flags.length === 0) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border bg-green-100 text-green-800 border-green-200">
        Low
      </span>
    );
  }

  // Pick highest severity from flags
  const order = ['Critical', 'High', 'Medium', 'Low'];
  let top = FLAG_TO_RISK[flags[0]] ?? { level: 'Medium', style: 'bg-yellow-100 text-yellow-800 border-yellow-200' };

  for (const flag of flags) {
    const mapped = FLAG_TO_RISK[flag];
    if (mapped && order.indexOf(mapped.level) < order.indexOf(top.level)) {
      top = mapped;
    }
  }

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${top.style}`}>
      {top.level}
    </span>
  );
}
