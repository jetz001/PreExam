import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronDown,
    Building2,
    GraduationCap,
    Shield,
    Landmark,
    Stethoscope,
    Scale,
} from 'lucide-react';

const AGENCY_ICONS = [
    {
        name: 'general',
        icon: Building2,
        badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/35',
        glowClass: 'bg-indigo-400',
    },
    {
        name: 'education',
        icon: GraduationCap,
        badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-400/35',
        glowClass: 'bg-sky-400',
    },
    {
        name: 'security',
        icon: Shield,
        badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-400/35',
        glowClass: 'bg-rose-400',
    },
    {
        name: 'admin',
        icon: Landmark,
        badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/35',
        glowClass: 'bg-emerald-400',
    },
    {
        name: 'health',
        icon: Stethoscope,
        badgeClass: 'bg-pink-500/20 text-pink-200 border-pink-400/35',
        glowClass: 'bg-pink-400',
    },
    {
        name: 'legal',
        icon: Scale,
        badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-400/35',
        glowClass: 'bg-amber-400',
    },
];

const AgencyGrid = ({ agencies }) => {
    const [expandedMinistry, setExpandedMinistry] = useState(null);
    const navigate = useNavigate();

    const getAgencyIcon = (name) => {
        if (!name) return AGENCY_ICONS[0];
        if (name.includes('ครู') || name.includes('ศึกษา')) return AGENCY_ICONS[1];
        if (name.includes('ทหาร') || name.includes('ตำรวจ') || name.includes('ความมั่นคง')) return AGENCY_ICONS[2];
        if (name.includes('สาธารณสุข') || name.includes('แพทย์')) return AGENCY_ICONS[4];
        if (name.includes('ศาล') || name.includes('ยุติธรรม')) return AGENCY_ICONS[5];
        if (name.includes('มหาดไทย') || name.includes('จังหวัด') || name.includes('ปกครอง')) return AGENCY_ICONS[3];

        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return AGENCY_ICONS[hash % AGENCY_ICONS.length];
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    const isNew = (dateString) => {
        if (!dateString) return false;
        const diff = new Date() - new Date(dateString);
        return diff < 3 * 24 * 60 * 60 * 1000;
    };

    if (!agencies || agencies.length === 0) return null;

    return (
        <div className="space-y-3.5 pb-6">
            {agencies.map((ministryGroup, mIdx) => {
                const isExpanded = expandedMinistry === ministryGroup.ministry;
                const totalCount = ministryGroup.departments.reduce((sum, dep) => sum + dep.count, 0);
                const ministryIconData = getAgencyIcon(ministryGroup.ministry);
                const MinistryIcon = ministryIconData.icon;

                return (
                    <div
                        key={mIdx}
                        className="bg-white/10 backdrop-blur-md border border-white/18 rounded-2xl overflow-hidden transition-all shadow-md"
                    >
                        {/* Ministry Header */}
                        <button
                            type="button"
                            aria-expanded={isExpanded}
                            className="w-full text-left flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffcc00]"
                            onClick={() => setExpandedMinistry(isExpanded ? null : ministryGroup.ministry)}
                        >
                            <div className="flex items-center gap-3.5 min-w-0">
                                {ministryGroup.logo ? (
                                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm shrink-0">
                                        <img
                                            src={ministryGroup.logo}
                                            alt={ministryGroup.ministry}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center ${ministryIconData.badgeClass}`}
                                    >
                                        <MinistryIcon size={21} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                                        <span className="break-words">{ministryGroup.ministry}</span>
                                        {ministryGroup.lastUpdated && isNew(ministryGroup.lastUpdated) && (
                                            <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                                New
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-white/75 flex items-center gap-2 flex-wrap mt-0.5">
                                        <span>{ministryGroup.departments.length} หน่วยงาน</span>
                                        <span aria-hidden="true">•</span>
                                        <span>รวม {totalCount} อัตรา</span>
                                        {ministryGroup.lastUpdated && (
                                            <>
                                                <span aria-hidden="true">•</span>
                                                <span className="text-emerald-300 font-semibold">
                                                    อัปเดต: {formatDate(ministryGroup.lastUpdated)}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="text-white/75 shrink-0 ml-2">
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                        </button>

                        {/* Departments Grid */}
                        {isExpanded && (
                            <div className="p-4 pt-3 border-t border-white/15 bg-black/20">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                                    {ministryGroup.departments.map((dep, dIdx) => {
                                        const iconData = getAgencyIcon(dep.department);
                                        const Icon = iconData.icon;
                                        return (
                                            <button
                                                type="button"
                                                key={dIdx}
                                                onClick={() =>
                                                    navigate(
                                                        '/news/agency/' +
                                                            encodeURIComponent(dep.department) +
                                                            '?ministry=' +
                                                            encodeURIComponent(ministryGroup.ministry)
                                                    )
                                                }
                                                className="a-card group text-left p-4 relative overflow-hidden flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                                            >
                                                <div
                                                    className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-15 transition-transform group-hover:scale-150 ${iconData.glowClass}`}
                                                />

                                                <div className="flex justify-between items-start mb-3 w-full relative z-10">
                                                    {dep.logo ? (
                                                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                                                            <img
                                                                src={dep.logo}
                                                                alt={dep.department}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconData.badgeClass}`}
                                                        >
                                                            <Icon size={22} />
                                                        </div>
                                                    )}

                                                    {dep.lastUpdated && isNew(dep.lastUpdated) && (
                                                        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black shadow">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="font-bold text-white text-sm mb-2 line-clamp-2 min-h-[2.5rem] break-words relative z-10">
                                                    {dep.department}
                                                </h4>

                                                <div className="mt-auto pt-2 flex items-center justify-between w-full relative z-10 gap-2">
                                                    <div className="inline-flex items-center px-2.5 py-1 bg-white/15 rounded-full text-xs font-bold text-white">
                                                        {dep.count} อัตรา
                                                    </div>
                                                    {dep.lastUpdated && (
                                                        <div className="text-[11px] text-white/75 font-medium">
                                                            {formatDate(dep.lastUpdated)}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
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
