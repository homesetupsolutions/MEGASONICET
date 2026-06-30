interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: string;
  onClick?: () => void;
}

export default function KPICard({ label, value, sub, color = '#00f5ff', icon, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0d0d1a] border rounded-xl p-5 transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      style={{ borderColor: color + '40' }}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-[#64748b] uppercase tracking-wider">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[#64748b] mt-1">{sub}</p>}
    </div>
  );
}
