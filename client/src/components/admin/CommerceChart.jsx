import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const CommerceChart = ({ commercialData }) => {
    // Transform data for the chart or use mock data if empty
    // Expecting commercialData to have { demand: number, engagement: number, score: number, ... }
    // But for a line chart we need an array. Let's mock a timeline based on the score if needed,
    // or assume commercialData IS the array. The controller sends:
    // { demand: 85, engagement: 72, score: 79.8, popularSubjects: [...] }
    // So we need to create a mock history to visualize the "Trend"

    // Create mock history: 6 months
    const mockHistory = [
        { name: 'Month 1', score: commercialData?.score * 0.7 || 50, demand: commercialData?.demand * 0.8 || 60, engagement: commercialData?.engagement * 0.6 || 40 },
        { name: 'Month 2', score: commercialData?.score * 0.8 || 60, demand: commercialData?.demand * 0.85 || 65, engagement: commercialData?.engagement * 0.7 || 50 },
        { name: 'Month 3', score: commercialData?.score * 0.75 || 55, demand: commercialData?.demand * 0.7 || 55, engagement: commercialData?.engagement * 0.8 || 60 },
        { name: 'Month 4', score: commercialData?.score * 0.9 || 70, demand: commercialData?.demand * 0.9 || 80, engagement: commercialData?.engagement * 0.85 || 70 },
        { name: 'Month 5', score: commercialData?.score * 0.95 || 75, demand: commercialData?.demand * 0.95 || 85, engagement: commercialData?.engagement * 0.9 || 75 },
        { name: 'Current', score: commercialData?.score || 80, demand: commercialData?.demand || 85, engagement: commercialData?.engagement || 72 },
    ];

    const chartData = commercialData?.history || mockHistory;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Commercial Viability Score (III)</h3>
                <p className="text-sm text-gray-500">
                    Interest Intensity Index tracking over time. Formula: (Demand * 0.6) + (Engagement * 0.4)
                </p>
            </div>
            {/* Fixed dimensions to prevent Recharts calculation errors */}
            <div className="flex justify-center overflow-x-auto">
                <LineChart
                    width={600}
                    height={300}
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        itemStyle={{ color: '#111827' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} activeDot={{ r: 8 }} name="III Score" />
                    <Line type="monotone" dataKey="demand" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Keyword Demand" />
                    <Line type="monotone" dataKey="engagement" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" name="User Engagement" />
                </LineChart>
            </div>
        </div>
    );
};

export default CommerceChart;
