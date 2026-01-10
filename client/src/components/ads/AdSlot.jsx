import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import { ExternalLink } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const AdSlot = ({ placement, className = "" }) => {
    // Viewability Logic
    const { ref, inView } = useInView({
        threshold: 0.5, // 50% visible
        triggerOnce: false
    });

    // Tracking state
    const [viewRecorded, setViewRecorded] = useState(false);
    const timerRef = useRef(null);

    // Determine fallback type once (Moved to top level)
    const [fallbackType] = useState(() => Math.random() < 0.5 ? 'house' : 'google');

    // Map placement for API (community, news, result)
    // Prop 'placement' might be 'in-feed' or generic 'feed'. We standardize here.
    const apiPlacement = placement === 'in-feed' || placement === 'feed' ? 'community' : placement;
    // Note: If user passes 'news' or 'result', it stays 'news' or 'result'.

    // Fetch Ad
    const { data: ad, isLoading, isError } = useQuery({
        queryKey: ['serveAd', apiPlacement],
        queryFn: async () => {
            const data = await adsApi.serveAd(apiPlacement);

            // If API returns { served: false }, return null to trigger fallback
            if (!data || data.served === false) return null;
            return data.ad; // Unwrap the 'ad' object
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // Cache for a bit
    });

    // Fetch Config for House Ad details (Moved from conditional block)
    const { data: config } = useQuery({
        queryKey: ['adsConfig'],
        queryFn: adsApi.getAdsConfig,
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: (!!isError || !ad) && fallbackType !== 'google' // Only fetch if fallback needed and not generic google
    });

    // Viewability Timer
    useEffect(() => {
        if (inView && ad && !viewRecorded) {
            timerRef.current = setTimeout(() => {
                // Trigger 'Burn' API
                adsApi.recordView(ad.id, apiPlacement).catch(err => console.error("Failed to record view", err));
                setViewRecorded(true);
                console.log(`Ad ${ad.id} view recorded (Viewability > 1s) at ${apiPlacement}`);
            }, 1000); // 1 second threshold
        } else {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [inView, ad, viewRecorded, apiPlacement]);

    if (isLoading) return <div className={`animate-pulse bg-gray-100 rounded-lg h-32 ${className}`}></div>;

    // Fallback to AdSense or House Ad
    if (!ad || isError) {
        if (fallbackType === 'google') {
            return (
                <div className={`bg-gray-50 border border-gray-200 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 text-xs p-4 ${className}`}>
                    <span className="mb-1">Google AdSense</span>
                    <span className="text-[10px] text-gray-300">Display Ads</span>
                </div>
            );
        } else {
            // Render House Ad (Self Promotion)

            // House Ad Data
            const houseAd = {
                title: config?.houseAdTitle || 'ลงโฆษณากับเรา / Advertise Here',
                description: config?.houseAdDescription || 'เข้าถึงกลุ่มเป้าหมายนักเรียนกว่า 10,000 คน เริ่มต้นเพียง 100 บาท/วัน',
                image: config?.houseAdImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                url: config?.houseAdUrl || '/business',
                brandName: 'PreExam Ads',
                logo: 'https://cdn-icons-png.flaticon.com/512/2589/2589175.png' // Bullhorn icon
            };

            return (
                <div ref={ref} className={className}>
                    <a
                        href={houseAd.url}
                        className="block group relative bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`flex ${apiPlacement === 'community' ? 'flex-col' : 'flex-row'}`}>
                            <div className={`${apiPlacement === 'community' ? 'w-full h-64' : 'w-1/3 md:w-1/4'} relative overflow-hidden`}>
                                <img src={houseAd.image} alt={houseAd.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-90" />
                                <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                    PreExam
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-center bg-indigo-50/30">
                                <div className="flex items-center mb-1">
                                    <div className="w-4 h-4 rounded-full mr-2 bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold">P</div>
                                    <span className="text-xs text-indigo-600 font-medium">{houseAd.brandName}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1 group-hover:text-indigo-700 transition-colors">
                                    {houseAd.title}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {houseAd.description}
                                </p>
                            </div>
                        </div>
                    </a>
                </div>
            );
        }
    }

    // Render Native Ad
    return (
        <div ref={ref} className={className}>
            <a
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                onClick={() => {
                    console.log('Ad Clicked at', apiPlacement);
                    adsApi.recordClick(ad.id, apiPlacement);
                }}
            >
                <div className={`flex ${apiPlacement === 'community' ? 'flex-col' : 'flex-row'}`}>
                    <div className={`${apiPlacement === 'community' ? 'w-full h-64' : 'w-1/3 md:w-1/4'} relative overflow-hidden`}>
                        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                            Ad
                        </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                        <div className="flex items-center mb-1">
                            <img src={ad.logo} alt="" className="w-4 h-4 rounded-full mr-2 object-cover" />
                            <span className="text-xs text-gray-500 font-medium">{ad.brandName}</span>
                            <ExternalLink size={10} className="ml-1 text-gray-300" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                            {ad.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                            {ad.description || "Sponsored content recommended for you."}
                        </p>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default AdSlot;
