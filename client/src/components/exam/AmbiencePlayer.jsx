import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Wind } from 'lucide-react';

const sounds = [
    { id: 'rain', name: 'Rain', icon: CloudRain, url: '/assets/sounds/rain.mp3' }, // Assumption: assets exist or will be placeholders
    { id: 'cafe', name: 'Cafe', icon: Coffee, url: '/assets/sounds/cafe.mp3' },
    { id: 'wind', name: 'White Noise', icon: Wind, url: '/assets/sounds/whitenoise.mp3' },
];

const AmbiencePlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSound, setCurrentSound] = useState(sounds[0]);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(error => {
                        console.log("Audio playback failed (likely missing file):", error);
                        setIsPlaying(false);
                        alert(`Cannot play audio: The file for '${currentSound.name}' is missing.`);
                    });
            }
        }
    };

    const changeSound = (sound) => {
        setCurrentSound(sound);
        if (isPlaying) {
            // Audio ref src will update on render, just need to play after update
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.log("Audio switch failed:", e));
                }
            }, 0);
        }
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white p-3 rounded-xl shadow-lg border border-gray-200 w-64 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Zen Mode</span>
                <button
                    onClick={togglePlay}
                    className={`p-2 rounded-full ${isPlaying ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
            </div>

            {isPlaying && (
                <div className="space-y-2 animate-fadeIn">
                    <div className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar">
                        {sounds.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => changeSound(sound)}
                                className={`flex flex-col items-center p-2 rounded-lg min-w-[3rem] ${currentSound.id === sound.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                            >
                                <sound.icon size={16} />
                                <span className="text-[10px] mt-1">{sound.name}</span>
                            </button>
                        ))}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}
            {/* Hidden Audio Element */}
            {/* Note: In a real app, use a real URL. For now, we use a placeholder that might fail 404 but UI works */}
            <audio
                ref={audioRef}
                src={currentSound.url}
                loop
                onError={(e) => {
                    console.log("Audio source error:", e);
                    if (isPlaying) setIsPlaying(false);
                }}
            />
        </div>
    );
};

export default AmbiencePlayer;
