import React, { useState, useRef, useLayoutEffect } from 'react';

const ReadMoreText = ({ content, children, className = "", forceExpanded = false, limitLines = 3 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const textRef = useRef(null);

    useLayoutEffect(() => {
        if (textRef.current) {
            const { scrollHeight, clientHeight } = textRef.current;
            // Add a small buffer to avoid showing button for very minor overflows
            setShouldShowButton(scrollHeight > clientHeight + 2);
        }
    }, [content, children]);

    const toggleReadMore = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const lineClampClass = limitLines === 3 ? 'line-clamp-3' : `line-clamp-${limitLines}`;

    return (
        <div className={`relative ${className}`}>
            <div
                ref={textRef}
                className={(isExpanded || forceExpanded) ? '' : `${lineClampClass} overflow-hidden`}
            >
                {children ? children : (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                )}
            </div>

            {shouldShowButton && !forceExpanded && (
                <button
                    onClick={toggleReadMore}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs mt-1 focus:outline-none flex items-center gap-1"
                >
                    {isExpanded ? '...แสดงน้อยลง' : '...อ่านเพิ่มเติม'}
                </button>
            )}
        </div>
    );
};

export default ReadMoreText;
