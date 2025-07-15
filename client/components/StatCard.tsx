interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  borderColor: string;
  trend?: {
    icon: React.ReactNode;
    value: React.ReactNode;
    label: string;
  };
}

export function StatCard({
  title,
  value,
  icon,
  borderColor,
  trend,
}: StatCardProps) {
  return (
    <div className="flex min-w-[250px] py-6 px-[30px] flex-col items-start self-stretch rounded-3xl bg-white">
      <div
        className={`flex min-h-[72px] pr-4 pl-[19px] items-start self-stretch border-l-[3px] ${borderColor}`}
      >
        <div className="flex p-2 flex-col items-start self-stretch">{icon}</div>
        <div className="flex pt-2 flex-col justify-center items-start self-stretch">
          <div className="flex flex-col items-start gap-1 flex-1">
            <div className="text-[#71717a] font-exo text-sm font-normal leading-5 flex flex-col items-start self-stretch">
              {title}
            </div>
            <div className="text-[#1f2937] font-exo text-2xl font-bold leading-8 flex flex-col items-start self-stretch">
              {value}
            </div>
          </div>
        </div>
      </div>
      {trend && (
        <div className="flex items-start gap-1 self-stretch px-1.5">
          <div className="flex pb-[1px] items-center gap-2 self-stretch">
            {trend.icon}
            <div className="text-[#22c55e] font-exo text-base font-bold leading-6">
              {trend.value}
            </div>
          </div>
          <div className="text-[#71717a] font-exo text-base font-normal leading-6">
            {trend.label}
          </div>
        </div>
      )}
    </div>
  );
}
