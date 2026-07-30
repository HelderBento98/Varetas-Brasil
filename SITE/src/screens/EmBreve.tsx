import { LucideIcon } from 'lucide-react';

interface EmBreveScreenProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmBreveScreen({ icon: Icon, title, description }: EmBreveScreenProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mb-5">
          <Icon size={28} className="text-[#007AFF]" />
        </div>
        <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider bg-[#007AFF]/10 px-3 py-1 rounded-full mb-3">
          Em breve
        </span>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">{title}</h2>
        <p className="text-gray-500 text-[15px] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
