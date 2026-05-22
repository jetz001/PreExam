import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageLoadTimer = () => {
    const [loadTime, setLoadTime] = useState(null);
    const location = useLocation();

    useEffect(() => {
        // Function to calculate load time
        const calculateLoadTime = () => {
            // We use setTimeout to allow for rendering to complete effectively capturing "perceived" load
            // for client-side route changes, standard window.performance is for valid full page loads.
            // For SPA navigations, we might just rely on the fact that this component re-mounts or re-renders.

            if (window.performance) {
                setTimeout(() => {
                    // Check for standard navigation entry first
                    const navEntry = window.performance.getEntriesByType("navigation")[0];
                    if (navEntry) {
                        const end = navEntry.loadEventEnd || navEntry.domComplete || navEntry.responseEnd;
                        const start = navEntry.startTime;
                        if (end > 0) {
                            const duration = (end - start) / 1000;
                            setLoadTime(duration.toFixed(2));
                        }
                    }
                }, 0);
            }
        };

        // Recalculate on mount (initial load)
        if (document.readyState === 'complete') {
            calculateLoadTime();
        } else {
            window.addEventListener('load', calculateLoadTime);
            return () => window.removeEventListener('load', calculateLoadTime);
        }
    }, []);

    // NOTE: For a true SPA "route change" timer, we would need to hook into router events 
    // and measure time between location change start and end. 
    // For now, we stick to the original request: "window.performance" based page load time,
    // which effectively shows the initial document load time. 
    // If the user wants per-route render time, that's a different complex beast.

    if (!loadTime) return null;

    return (
        <div className="w-full flex justify-end px-6 py-2 bg-transparent">
            <div className="text-xs text-slate-400 font-mono opacity-60 hover:opacity-100 transition-opacity select-none">
                Page Load: {loadTime}s
            </div>
        </div>
    );
};

export default PageLoadTimer;
