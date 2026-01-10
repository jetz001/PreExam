import React from 'react';
import { Type } from 'lucide-react';

const FontResizer = ({ onResize, currentSize }) => {
    // scale: 1 = normal, 1.25 = large, 1.5 = extra large
    const sizes = [1, 1.25, 1.5];

    return (
        <div className="fixed top-24 right-4 z-40 bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col space-y-2">
            <div className="text-xs text-center text-gray-400 font-bold mb-1">AABB</div>
            <button
                onClick={() => onResize(1)}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${currentSize === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                A
            </button>
            <button
                onClick={() => onResize(1.25)}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${currentSize === 1.25 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                A+
            </button>
            <button
                onClick={() => onResize(1.5)}
                className={`w-8 h-8 rounded flex items-center justify-center text-lg font-bold ${currentSize === 1.5 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                A++
            </button>
        </div>
    );
};

export default FontResizer;
