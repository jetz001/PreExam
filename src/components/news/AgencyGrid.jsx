import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Building2, Briefcase, GraduationCap, Shield, Landmark, Stethoscope, Scale } from 'lucide-react';

const icons = [
    { name: 'general', icon: Building2, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'education', icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
    { name: 'security', icon: Shield, color: 'bg-red-100 text-red-600' },
    { name: 'admin', icon: Landmark, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'health', icon: Stethoscope, color: 'bg-rose-100 text-rose-600' },
    { name: 'legal', icon: Scale, color: 'bg-amber-100 text-amber-600' },
];

const AgencyGrid = ({ agencies }) => {
    const [expandedMinistry, setExpandedMinistry] = useState(null);
    const navigate = useNavigate();

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

                const formatDate = (dateString) => {
                    if (!dateString) return null;
                    const d = new Date(dateString);
                    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
                };

                const isNew = (dateString) => {
                    if (!dateString) return false;
                    const diff = new Date() - new Date(dateString);
                    return diff < 3 * 24 * 60 * 60 * 1000; // 3 days
                };

                return (
                    <div key={mIdx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all">
                        {/* Ministry Header */}
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setExpandedMinistry(isExpanded ? null : ministryGroup.ministry)}
                        >
                            <div className="flex items-center gap-3">
                                {ministryGroup.logo ? (
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm shrink-0">
                                        <img src={ministryGroup.logo} alt={ministryGroup.ministry} className="w-full h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${getAgencyIcon(ministryGroup.ministry).color.replace('text-', 'bg-').replace('100', '500/20')} ${getAgencyIcon(ministryGroup.ministry).color.replace('bg-', 'text-').replace('100', '400')}`}>
                                        {React.createElement(getAgencyIcon(ministryGroup.ministry).icon, { size: 20 })}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                                        {ministryGroup.ministry}
                                        {ministryGroup.lastUpdated && isNew(ministryGroup.lastUpdated) && (
                                            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-black animate-pulse">New</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-white/50 flex items-center gap-2 flex-wrap">
                                        <span>{ministryGroup.departments.length} หน่วยงาน</span>
                                        <span>•</span>
                                        <span>รวม {totalCount} อัตรา</span>
                                        {ministryGroup.lastUpdated && (
                                            <>
                                                <span>•</span>
                                                <span className="text-emerald-400">อัปเดต: {formatDate(ministryGroup.lastUpdated)}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="text-white/50 shrink-0 ml-2">
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
                                        return (
                                            <div
                                                key={dIdx}
                                                onClick={() => navigate('/news/agency/' + encodeURIComponent(dep.department) + '?ministry=' + encodeURIComponent(ministryGroup.ministry))}
                                                className={`w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] shrink-0 a-card group cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl p-4 relative overflow-hidden transition-all flex flex-col`}
                                            >
                                                {/* Decorative background circle */}
                                                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${iconData.color.split(' ')[0]}`} />

                                                <div className="flex justify-between items-start mb-3">
                                                    {dep.logo ? (
                                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                                                            <img
                                                                src={dep.logo}
                                                                alt={dep.department}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconData.color.replace('text-', 'bg-').replace('100', '500/20')} ${iconData.color.replace('bg-', 'text-').replace('100', '400')}`}>
                                                            <Icon size={24} />
                                                        </div>
                                                    )}
                                                    
                                                    {dep.lastUpdated && isNew(dep.lastUpdated) && (
                                                        <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded shadow-lg">NEW</span>
                                                    )}
                                                </div>

                                                <h4 className="font-bold text-white text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                                                    {dep.department}
                                                </h4>

                                                <div className="mt-auto pt-3 flex items-center justify-between">
                                                    <div className="inline-flex items-center px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-white/80">
                                                        {dep.count} อัตรา
                                                    </div>
                                                    {dep.lastUpdated && (
                                                        <div className="text-[10px] text-white/40">
                                                            {formatDate(dep.lastUpdated)}
                                                        </div>
                                                    )}
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
