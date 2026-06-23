import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const LottieViewer = ({ url, className, style, preserveAspectRatio }) => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        if (!url) return;
        fetch(url)
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error('Failed to load Lottie', err));
    }, [url]);

    if (!animationData) return null;

    return (
        <Lottie 
            animationData={animationData} 
            loop={true} 
            className={className} 
            style={style} 
            rendererSettings={{
                preserveAspectRatio: preserveAspectRatio || 'xMidYMid meet'
            }}
        />
    );
};

export default LottieViewer;
