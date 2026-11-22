import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Wind, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';

const sounds = [
    { id: 'rain', name: 'Rain', label: 'เสียงฝน', icon: CloudRain, url: '/assets/sounds/rain.mp3' },
    { id: 'cafe', name: 'Cafe', label: 'คาเฟ่', icon: Coffee, url: '/assets/sounds/cafe.mp3' },
    { id: 'wind', name: 'White Noise', label: 'สายลม', icon: Wind, url: '/assets/sounds/whitenoise.mp3' },
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
                        toast.error(`ไม่สามารถเล่นเสียง '${currentSound.name}' ได้ (ไม่พบไฟล์เสียง)`);
                    });
            }
        }
    };

    const changeSound = (sound) => {
        setCurrentSound(sound);
        if (isPlaying) {
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
        <div
            className={`fixed bottom-20 left-3 sm:left-4 z-50 bg-slate-900/85 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/20 transition-all duration-200 font-['Sarabun','Nunito',sans-serif] ${
                isPlaying ? 'w-[calc(100vw-24px)] max-w-[260px] p-3.5' : 'px-3 py-2'
            }`}
        >
            <div className={`flex items-center justify-between gap-2.5 ${isPlaying ? 'mb-3' : ''}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-400/35 flex items-center justify-center shrink-0 text-indigo-300 shadow-inner">
                        <Headphones size={14} aria-hidden="true" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white/95 truncate">Zen Mode</span>
                </div>

                <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'ปิดเสียงบรรยากาศ' : 'เปิดเสียงบรรยากาศ'}
                    aria-pressed={isPlaying}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer shrink-0 ${
                        isPlaying
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/35 border border-white/30'
                            : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/15'
                    }`}
                >
                    {isPlaying ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
                </button>
            </div>

            {isPlaying && (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-1.5">
                        {sounds.map((sound) => {
                            const active = currentSound.id === sound.id;
                            const IconComp = sound.icon;
                            return (
                                <button
                                    key={sound.id}
                                    type="button"
                                    onClick={() => changeSound(sound)}
                                    aria-label={`เลือกเสียง ${sound.name}`}
                                    aria-pressed={active}
                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer ${
                                        active
                                            ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/50 shadow-sm'
                                            : 'bg-white/5 text-white/75 border-white/10 hover:bg-white/15 hover:text-white'
                                    }`}
                                >
                                    <IconComp size={15} aria-hidden="true" />
                                    <span className="text-[10px] font-semibold mt-1 truncate max-w-full">{sound.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                        <VolumeX size={12} className="text-white/50 shrink-0" aria-hidden="true" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            aria-label="ปรับระดับเสียงบรรยากาศ"
                            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        />
                        <Volume2 size={12} className="text-white/70 shrink-0" aria-hidden="true" />
                    </div>
                </div>
            )}

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
