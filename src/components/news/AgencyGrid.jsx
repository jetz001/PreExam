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

const AgencyGrid = ({ agencies, onAgencyClick, selectedAgency }) => {
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
        <div className="flex flex-wrap gap-4 md:gap-6 pb-6">
            {agencies.map((agency, idx) => {
                const iconData = getAgencyIcon(agency.agency);
                const Icon = iconData.icon;
                const isSelected = selectedAgency === agency.agency;

                return (
                    <div
                        key={idx}
                        onClick={() => onAgencyClick(agency.agency)}
                        className={`w-[calc(50%-8px)] md:w-[calc(25%-18px)] lg:w-[calc(20%-19px)] shrink-0 a-card group ${isSelected ? 'selected' : ''}`}
                    >
                        {/* Decorative background circle */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${iconData.color.split(' ')[0]}`} />

                        {agency.agency_logo ? (
                            <div className="a-icon-wrap bg-white">
                                <img
                                    src={agency.agency_logo}
                                    alt={agency.agency}
                                    className="w-10 h-10 object-contain drop-shadow-sm"
                                />
                            </div>
                        ) : (
                            <div className={`a-icon-wrap ${iconData.color.replace('text-', 'bg-').replace('100', '500')} text-white`}>
                                <Icon className="w-8 h-8" />
                            </div>
                        )}

                        <h3 className="font-bold text-white text-sm md:text-base mb-1 line-clamp-2 md:min-h-[2.5rem]">
                            {agency.agency}
                        </h3>

                        <div className="a-count-pill">
                            {agency.count} อัตรา
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AgencyGrid;
