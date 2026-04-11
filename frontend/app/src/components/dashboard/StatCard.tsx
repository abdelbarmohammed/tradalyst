interface Props {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;   // true = green, false = red, undefined = neutral
  loading?: boolean;
}

export default function StatCard({ label, value, sub, positive, loading }: Props) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-20 mb-3 rounded-sm" />
        <div className="skeleton h-7 w-28 rounded-sm" />
      </div>
    );
  }

  const valueColor =
    positive === true
      ? "text-profit"
      : positive === false
      ? "text-loss"
      : "text-primary";

  return (
    <div className="card p-5">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted mb-2">
        {label}
      </p>
      <p className={`font-mono text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums ${valueColor}`}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[10px] text-muted mt-1">{sub}</p>
      )}
    </div>
  );
}
