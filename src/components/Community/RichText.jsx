import React from 'react';
import { Link } from 'react-router-dom';

const RichText = ({ content, className = '' }) => {
    if (!content) return null;

    // Regex to match @mentions and #hashtags
    // @username (alphanumeric + underscore)
    // #tag (alphanumeric + underscore)
    // Regex to match @mentions, #hashtags, and URLs
    const regex = /([@#][\w\u0E00-\u0E7F]+)|(https?:\/\/[^\s]+)/g;

    const parts = content.split(regex).filter(Boolean); // Filter undefined captures from group

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    // Mention
                    return (
                        <span key={index} className="text-indigo-600 font-medium hover:underline cursor-pointer">
                            {part}
                        </span>
                    );
                } else if (part.startsWith('#')) {
                    // Hashtag
                    return (
                        <span key={index} className="text-blue-500 hover:underline cursor-pointer">
                            {part}
                        </span>
                    );
                } else if (part.startsWith('http')) {
                    // URL
                    return (
                        <a
                            key={index}
                            href={`/safety?target=${encodeURIComponent(part)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline break-all"
                        >
                            {part}
                        </a>
                    );
                } else {
                    // Normal text
                    return <span key={index}>{part}</span>;
                }
            })}
        </span>
    );
};

export default RichText;
