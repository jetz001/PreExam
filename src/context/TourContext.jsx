import React, { createContext, useContext, useEffect, useState } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { dashboardTourSteps } from '../config/tourConfig';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
    const [driverObj, setDriverObj] = useState(null);

    // Initialize Driver
    useEffect(() => {
        const drv = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Finish',
            closeBtnText: 'Skip',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            onDestroyStarted: () => {
                if (!driverObj?.hasNextStep() || confirm("Are you sure you want to quit the tour?")) {
                    driverObj?.destroy();
                }
            },
        });
        setDriverObj(drv);
    }, []);

    const startTour = (tourName) => {
        if (!driverObj) return;

        let steps = [];
        if (tourName === 'dashboard') steps = dashboardTourSteps;
        // else if (tourName === 'exam') steps = examRoomTourSteps;

        if (steps.length > 0) {
            driverObj.setSteps(steps);
            driverObj.drive();
            localStorage.setItem(`tour_seen_${tourName}`, 'true');
        }
    };

    const hasSeenTour = (tourName) => {
        return localStorage.getItem(`tour_seen_${tourName}`) === 'true';
    };

    // Auto-start dashboard tour if not seen
    const checkAndStartDashboardTour = () => {
        if (!hasSeenTour('dashboard')) {
            setTimeout(() => {
                startTour('dashboard');
            }, 1000); // Small delay for UI to load
        }
    };

    return (
        <TourContext.Provider value={{ startTour, hasSeenTour, checkAndStartDashboardTour }}>
            {children}
        </TourContext.Provider>
    );
};
