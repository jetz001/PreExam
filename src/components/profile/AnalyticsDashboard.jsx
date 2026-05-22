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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">Skill Analysis</h4>
                    <div className="w-full h-[300px] min-w-0">
                        {radarData && radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                    <Radar
                                        name="Score"
                                        dataKey="score"
                                        stroke="#4F46E5"
                                        fill="#4F46E5"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No examination data yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Heatmap */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Study Consistency</h4>
                        <div className="group relative">
                            <Info size={16} className="text-gray-400 cursor-help" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 text-center">
                                Heatmap นี้แสดงความสม่ำเสมอในการเรียนของคุณในแต่ละวัน สีที่เข้มขึ้นหมายถึงมีการทำข้อสอบหรือทำโจทย์มากขึ้น
                            </div>
                        </div>
                    </div>
                    <div className="heatmap-container overflow-x-auto">
                        <CalendarHeatmap
                            startDate={new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())}
                            endDate={today}
                            values={Array.isArray(heatmapData) ? heatmapData : []}
                            classForValue={(value) => {
                                if (!value) {
                                    return 'color-empty fill-current text-gray-200 dark:text-slate-700';
                                }
                                return `color-scale-${Math.min(value.count, 4)} fill-current text-blue-600`;
                            }}
                            tooltipDataAttrs={value => {
                                return {
                                    'data-tip': `${value.date} has count: ${value.count}`,
                                };
                            }}
                            showWeekdayLabels={true}
                        />
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-500">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded-sm"></div>
                            <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                            <div className="w-3 h-3 bg-blue-800 rounded-sm"></div>
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
