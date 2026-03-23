import React from 'react';
import { Building2, Briefcase, ChevronRight, GraduationCap, Shield, Landmark, Users2, Stethoscope, Scale } from 'lucide-react';

const icons = [
    { name: 'general', icon: Building2, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'education', icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
    { name: 'security', icon: Shield, color: 'bg-red-100 text-red-600' },
    { name: 'admin', icon: Landmark, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'health', icon: Stethoscope, color: 'bg-rose-100 text-rose-600' },
    { name: 'legal', icon: Scale, color: 'bg-amber-100 text-amber-600' },
];

const AgencyGrid = ({ agencies, onAgencyClick }) => {
    // Helper to get a semi-random icon based on agency name text
    const getAgencyIcon = (name) => {
        if (name.includes('ครู') || name.includes('ศึกษา')) return icons[1];
        if (name.includes('ทหาร') || name.includes('ตำรวจ') || name.includes('ความมั่นคง')) return icons[2];
        if (name.includes('สาธารณสุข') || name.includes('แพทย์')) return icons[4];
        if (name.includes('ศาล') || name.includes('ยุติธรรม')) return icons[5];
        if (name.includes('มหาดไทย') || name.includes('จังหวัด') || name.includes('ปกครอง')) return icons[3];

        // Default based on hash
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return icons[hash % icons.length];
    };

    if (!agencies || agencies.length === 0) return null;

    return (
        <div className="grid grid-rows-2 grid-flow-col auto-cols-[calc(50%-8px)] md:auto-cols-[calc(25%-18px)] gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
            {agencies.map((agency, idx) => {
                const iconData = getAgencyIcon(agency.agency);
                const Icon = iconData.icon;

                return (
                    <div
                        key={idx}
                        onClick={() => onAgencyClick(agency.agency)}
                        className="snap-center shrink-0 group bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        {/* Decorative background circle */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 ${iconData.color.split(' ')[0]}`} />

                        {agency.agency_logo ? (
                            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-none bg-transparent">
                                <img
                                    src={agency.agency_logo}
                                    alt={agency.agency}
                                    className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
                                />
                            </div>
                        ) : (
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm ${iconData.color}`}>
                                <Icon className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                        )}

                        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1 line-clamp-2 md:min-h-[3rem]">
                            {agency.agency}
                        </h3>

                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs md:text-sm mt-1">
                            <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                            {agency.count} ตำแหน่งว่าง
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AgencyGrid;
