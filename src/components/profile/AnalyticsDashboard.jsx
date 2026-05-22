import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { Download, Share2, Info } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import jsPDF from 'jspdf';

const AnalyticsDashboard = ({ heatmapData, radarData, user }) => {
    const dashboardRef = useRef(null);
    const navigate = useNavigate();

    const handleShareToThreads = async () => {
        if (!dashboardRef.current) return;

        try {
            const filter = (node) => {
                const exclusionClasses = ['export-exclude'];
                return !exclusionClasses.some((classname) => node.classList?.contains(classname));
            }
            const blob = await toBlob(dashboardRef.current, { cacheBust: true, pixelRatio: 2, filter: filter });
            if (blob) {
                navigate('/community', { state: { sharedImage: blob } });
            }
        } catch (error) {
            console.error("Failed to generate image for sharing", error);
        }
    };

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current) return;

        try {
            const filter = (node) => {
                const exclusionClasses = ['export-exclude'];
                return !exclusionClasses.some((classname) => node.classList?.contains(classname));
            }
            const dataUrl = await toPng(dashboardRef.current, { cacheBust: true, pixelRatio: 2, filter: filter });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const element = dashboardRef.current;
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PreExam_Report_${user.display_name}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        }
    };

    const today = new Date();

    return (
        <div className="space-y-6" ref={dashboardRef}>
            {/* Header with Actions */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Performance Analytics</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadPDF}
                        className="export-exclude flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
                    >
                        <Download size={16} /> Export Report
                    </button>
                    <button
                        onClick={handleShareToThreads}
                        className="export-exclude flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium transition"
                    >
                        <Share2 size={16} /> Share to Threads
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Radar Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-[#1368ce]/10 dark:border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    {/* Decorative element */}
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#1368ce] rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <h4 className="text-xl font-black text-[#1368ce] dark:text-blue-400 mb-6 uppercase tracking-widest relative z-10 flex items-center gap-2">
                        <span className="w-3 h-8 bg-[#1368ce] rounded-full inline-block"></span>
                        Skill Analysis
                    </h4>
                    <div className="w-full h-[320px] min-w-0 relative z-10">
                        {radarData && radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#46178f', fontWeight: 'bold', fontSize: 13 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                    <Radar
                                        name="Score"
                                        dataKey="score"
                                        stroke="#1368ce"
                                        strokeWidth={4}
                                        fill="#1368ce"
                                        fillOpacity={0.6}
                                        dot={{ r: 4, fill: '#ebbf00', strokeWidth: 2 }}
                                    />
                                    <Tooltip wrapperStyle={{ borderRadius: '1rem', overflow: 'hidden', fontWeight: 'bold' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 font-bold bg-gray-50 dark:bg-slate-700/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600">
                                No examination data yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Heatmap */}
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-[#26890c]/10 dark:border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    {/* Decorative element */}
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#26890c] rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <span className="w-3 h-8 bg-[#26890c] rounded-full inline-block"></span>
                        <h4 className="text-xl font-black text-[#26890c] dark:text-green-400 uppercase tracking-widest">Study Consistency</h4>
                        <div className="group/tooltip relative">
                            <Info size={20} className="text-[#ebbf00] cursor-help" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-[#46178f] text-white text-xs font-bold rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-20 text-center">
                                Heatmap นี้แสดงความสม่ำเสมอในการเรียนของคุณ สีที่เข้มขึ้นหมายถึงมีการทำโจทย์มากขึ้นในวันนั้น!
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#46178f]"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="heatmap-container overflow-x-auto relative z-10 bg-gray-50/50 dark:bg-slate-700/20 p-4 rounded-2xl border-2 border-gray-100 dark:border-slate-700">
                        <CalendarHeatmap
                            startDate={new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())}
                            endDate={today}
                            values={Array.isArray(heatmapData) ? heatmapData : []}
                            classForValue={(value) => {
                                if (!value) {
                                    return 'color-empty fill-current text-gray-200 dark:text-slate-700';
                                }
                                return `color-scale-${Math.min(value.count, 4)} fill-current text-[#26890c] drop-shadow-sm`;
                            }}
                            tooltipDataAttrs={value => {
                                return {
                                    'data-tip': `${value.date} has count: ${value.count}`,
                                };
                            }}
                            showWeekdayLabels={true}
                        />
                    </div>
                    
                    <div className="flex justify-end items-center gap-3 mt-6 text-xs font-bold text-gray-500 uppercase tracking-wider relative z-10">
                        <span>Less</span>
                        <div className="flex gap-2 bg-gray-100 dark:bg-slate-700 p-2 rounded-xl">
                            <div className="w-4 h-4 bg-gray-200 dark:bg-slate-600 rounded-md"></div>
                            <div className="w-4 h-4 bg-[#c8e6c9] rounded-md shadow-sm"></div>
                            <div className="w-4 h-4 bg-[#81c784] rounded-md shadow-sm"></div>
                            <div className="w-4 h-4 bg-[#4caf50] rounded-md shadow-sm"></div>
                            <div className="w-4 h-4 bg-[#2e7d32] rounded-md shadow-sm"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>

            <style>{`
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #aaa;
        }
        .react-calendar-heatmap .color-scale-1 { fill: #dbeafe; } /* blue-100 */
        .react-calendar-heatmap .color-scale-2 { fill: #93c5fd; } /* blue-300 */
        .react-calendar-heatmap .color-scale-3 { fill: #3b82f6; } /* blue-500 */
        .react-calendar-heatmap .color-scale-4 { fill: #1e40af; } /* blue-800 */
        .react-calendar-heatmap rect { rx: 2px; }
      `}</style>
        </div>
    );
};

export default AnalyticsDashboard;
