import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import { Flame } from 'lucide-react';

const DailyBurnList = () => {
    const { data: dailyBurn, isLoading } = useQuery({
        queryKey: ['dailyBurn'],
        queryFn: adsApi.getDailyBurn,
        initialData: []
    });

    if (isLoading) return <div className="text-center text-xs text-gray-400 py-2">Loading transactions...</div>;

    if (!dailyBurn || dailyBurn.length === 0) {
        return <div className="text-center text-xs text-gray-400 py-2">No recent ad spend.</div>;
    }

    return (
        <>
            {dailyBurn.map((item, index) => (
                <div key={`${item.date}-${index}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                        <div className="p-1.5 rounded-full bg-orange-50 mr-3">
                            <Flame size={14} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">Daily Burn</p>
                            <p className="text-xs text-gray-500">{item.adTitle}</p>
                            <p className="text-[10px] text-gray-400">{item.date}</p>
                        </div>
                    </div>
                    <span className="text-red-500 font-medium">-฿{item.amount.toLocaleString()}</span>
                </div>
            ))}
        </>
    );
};

export default DailyBurnList;
