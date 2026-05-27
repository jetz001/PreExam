import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Briefcase, GraduationCap, Shield, Landmark, Stethoscope, Scale } from 'lucide-react';

const icons = [
    { name: 'general', icon: Building2, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'education', icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
    { name: 'security', icon: Shield, color: 'bg-red-100 text-red-600' },
    { name: 'admin', icon: Landmark, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'health', icon: Stethoscope, color: 'bg-rose-100 text-rose-600' },
    { name: 'legal', icon: Scale, color: 'bg-amber-100 text-amber-600' },
];

const AgencyGrid = ({ agencies, onAgencyClick, selectedAgency }) => {
    const [expandedMinistry, setExpandedMinistry] = useState(null);

    const getAgencyIcon = (name) => {
        if (!name) return icons[0];
        if (name.includes('ครู') || name.includes('ศึกษา')) return icons[1];
        if (name.includes('ทหาร') || name.includes('ตำรวจ') || name.includes('ความมั่นคง')) return icons[2];
        if (name.includes('สาธารณสุข') || name.includes('แพทย์')) return icons[4];
        if (name.includes('ศาล') || name.includes('ยุติธรรม')) return icons[5];
        if (name.includes('มหาดไทย') || name.includes('จังหวัด') || name.includes('ปกครอง')) return icons[3];

        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return icons[hash % icons.length];
    };

    if (!agencies || agencies.length === 0) return null;

    return (
        <div className="space-y-4 pb-6">
            {agencies.map((ministryGroup, mIdx) => {
                const isExpanded = expandedMinistry === ministryGroup.ministry;
                const totalCount = ministryGroup.departments.reduce((sum, dep) => sum + dep.count, 0);

                return (
                    <div key={mIdx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all">
                        {/* Ministry Header */}
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setExpandedMinistry(isExpanded ? null : ministryGroup.ministry)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">{ministryGroup.ministry}</h3>
                                    <p className="text-sm text-white/50">{ministryGroup.departments.length} กรม/หน่วยงาน • รวม {totalCount} อัตรา</p>
                                </div>
                            </div>
                            <div className="text-white/50">
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                        </div>

                        {/* Departments Grid */}
                        {isExpanded && (
                            <div className="p-4 pt-0 border-t border-white/10 bg-black/20">
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {ministryGroup.departments.map((dep, dIdx) => {
                                        const iconData = getAgencyIcon(dep.department);
                                        const Icon = iconData.icon;
                                        const isSelected = selectedAgency === dep.department;

                                        return (
                                            <div
                                                key={dIdx}
                                                onClick={() => onAgencyClick(dep.department)}
                                                className={`w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] shrink-0 a-card group cursor-pointer ${isSelected ? 'selected ring-2 ring-[#ffcc00] bg-white/10' : 'bg-white/5 hover:bg-white/10'} rounded-xl p-4 relative overflow-hidden transition-all`}
                                            >
                                                {/* Decorative background circle */}
                                                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${iconData.color.split(' ')[0]}`} />

                                                {dep.logo ? (
                                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm mb-3">
                                                        <img
                                                            src={dep.logo}
                                                            alt={dep.department}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${iconData.color.replace('text-', 'bg-').replace('100', '500/20')} ${iconData.color.replace('bg-', 'text-').replace('100', '400')}`}>
                                                        <Icon size={24} />
                                                    </div>
                                                )}

                                                <h4 className="font-bold text-white text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                                                    {dep.department}
                                                </h4>

                                                <div className="inline-flex items-center px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-white/80 mt-2">
                                                    {dep.count} อัตรา
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AgencyGrid;
