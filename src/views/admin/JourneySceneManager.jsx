import React, { useState, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, Upload, GripVertical, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';

const DEFAULT_SCENES = [
    { id: 'dawn',   name: 'รุ่งอรุณ', emoji: '🌅', bgGradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 40%, #7c2d12 80%, #92400e 100%)', overlayTint: 'rgba(120, 40, 20, 0.25)', accentColor: '#f97316' },
    { id: 'forest', name: 'ป่าลึก', emoji: '🌲', bgGradient: 'linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 70%, #15803d 100%)', overlayTint: 'rgba(5, 46, 22, 0.35)', accentColor: '#4ade80' },
    { id: 'city',   name: 'เมืองใหม่', emoji: '🏙️', bgGradient: 'linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e3a5f 80%, #1e40af 100%)', overlayTint: 'rgba(30, 64, 175, 0.2)', accentColor: '#60a5fa' },
    { id: 'summit', name: 'ยอดเขา', emoji: '🏔️', bgGradient: 'linear-gradient(160deg, #0f172a 0%, #334155 40%, #94a3b8 80%, #f1f5f9 100%)', overlayTint: 'rgba(241, 245, 249, 0.15)', accentColor: '#38bdf8' },
];

const Label = ({ children }) => (
    <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
        {children}
    </div>
);

const Field = ({ label, children }) => (
    <div>
        <Label>{label}</Label>
        {children}
    </div>
);

const inputStyle = {
    width:'100%', borderRadius:10, border:'1px solid #e2e8f0',
    padding:'10px 14px', fontSize:'0.9rem', outline:'none', transition:'border-color 0.2s',
    background: '#fff'
};

const JourneySceneManager = ({ systemSettings }) => {
    const queryClient = useQueryClient();
    
    // Parse existing scenes or fall back to defaults
    const initialScenes = useMemo(() => {
        const stored = systemSettings?.settings?.journey_scenes;
        if (stored && Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
        return DEFAULT_SCENES.map(s => ({ ...s }));
    }, [systemSettings]);

    const [scenes, setScenes] = useState(initialScenes);
    const [selectedId, setSelectedId] = useState(scenes[0]?.id || null);
    const [uploadingId, setUploadingId] = useState(null);

    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, index) => {
        dragItem.current = index;
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current == null || dragOverItem.current == null) return;
        if (dragItem.current === dragOverItem.current) return;
        
        const copyListItems = [...scenes];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        
        dragItem.current = null;
        dragOverItem.current = null;
        setScenes(copyListItems);
    };

    const activeScene = useMemo(() => scenes.find(s => s.id === selectedId) || scenes[0], [scenes, selectedId]);

    const saveMutation = useMutation({
        mutationFn: async (payload) => adminApi.updateSystemSettings({
            ...(systemSettings?.settings || {}),
            journey_scenes: payload
        }),
        onSuccess: (data, payload) => {
            queryClient.setQueryData(['systemSettings'], (old) => ({
                ...old,
                settings: { ...old?.settings, journey_scenes: payload }
            }));
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
            toast.success('บันทึกการตั้งค่าฉากหลังเรียบร้อย ✅');
        },
        onError: () => toast.error('บันทึกไม่สำเร็จ'),
    });

    const uploadMutation = useMutation({
        mutationFn: adminApi.uploadFileToR2,
        onSuccess: (result) => {
            if (result.success && result.url) {
                updateScene(uploadingId, 'animationUrl', result.url);
                toast.success('อัปโหลดแอนิเมชันสำเร็จ ✅');
            } else {
                toast.error('อัปโหลดผิดพลาด');
            }
        },
        onError: () => toast.error('อัปโหลดไม่สำเร็จ'),
        onSettled: () => setUploadingId(null)
    });

    const handleFileUpload = (e, sceneId) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingId(sceneId);
        uploadMutation.mutate(file);
    };

    const updateScene = (id, field, value) => {
        setScenes(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleAddScene = () => {
        const newId = `scene_${Date.now()}`;
        setScenes(prev => [...prev, {
            id: newId,
            name: 'ฉากใหม่',
            emoji: '✨',
            bgGradient: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
            overlayTint: 'rgba(0, 0, 0, 0.2)',
            accentColor: '#3b82f6',
            animationUrl: ''
        }]);
        setSelectedId(newId);
    };

    const handleDeleteScene = (id) => {
        if (scenes.length <= 1) {
            toast.error('ต้องมีอย่างน้อย 1 ฉาก');
            return;
        }
        setScenes(prev => prev.filter(s => s.id !== id));
        if (selectedId === id) setSelectedId(scenes[0].id);
    };

    const handleSave = () => {
        saveMutation.mutate(scenes);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            {/* Sidebar List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>ลำดับฉาก</h3>
                        <button 
                            onClick={handleAddScene}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}
                        >
                            <Plus size={14} /> เพิ่มฉาก
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {scenes.map((s, index) => (
                            <div 
                                key={s.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => setSelectedId(s.id)}
                                style={{ 
                                    padding: '10px 12px', borderRadius: 10, cursor: 'grab',
                                    background: selectedId === s.id ? '#eff6ff' : 'white',
                                    border: `1px solid ${selectedId === s.id ? '#bfdbfe' : '#e2e8f0'}`,
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <GripVertical size={16} color="#cbd5e1" />
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', width: 20 }}>{index + 1}</div>
                                <div style={{ fontSize: '1.2rem' }}>{s.emoji}</div>
                                <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    style={{
                        background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12,
                        padding: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 12px rgba(59,130,246,0.25)', transition: 'background 0.2s'
                    }}
                >
                    <Save size={18} /> {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
            </div>

            {/* Editor */}
            {activeScene && (
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ImageIcon size={20} color="#3b82f6" /> ปรับแต่งฉาก: {activeScene.name}
                        </h2>
                        <button 
                            onClick={() => handleDeleteScene(activeScene.id)}
                            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}
                        >
                            <Trash2 size={14} /> ลบฉาก
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                        <Field label="ชื่อฉาก">
                            <input 
                                style={inputStyle} 
                                value={activeScene.name} 
                                onChange={e => updateScene(activeScene.id, 'name', e.target.value)} 
                            />
                        </Field>
                        <Field label="Emoji สัญลักษณ์">
                            <input 
                                style={inputStyle} 
                                value={activeScene.emoji} 
                                onChange={e => updateScene(activeScene.id, 'emoji', e.target.value)} 
                            />
                        </Field>
                        
                        <Field label="สีพื้นหลัง (CSS Background)">
                            <input 
                                style={inputStyle} 
                                value={activeScene.bgGradient} 
                                onChange={e => updateScene(activeScene.id, 'bgGradient', e.target.value)} 
                                placeholder="e.g., linear-gradient(...)"
                            />
                        </Field>
                        <Field label="สีทับซ้อน (Overlay Tint)">
                            <input 
                                style={inputStyle} 
                                value={activeScene.overlayTint} 
                                onChange={e => updateScene(activeScene.id, 'overlayTint', e.target.value)} 
                                placeholder="e.g., rgba(0,0,0,0.2)"
                            />
                        </Field>
                        <Field label="สีเน้น (Accent Color)">
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input 
                                    type="color"
                                    value={activeScene.accentColor} 
                                    onChange={e => updateScene(activeScene.id, 'accentColor', e.target.value)}
                                    style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                                />
                                <input 
                                    style={{ ...inputStyle, flex: 1 }} 
                                    value={activeScene.accentColor} 
                                    onChange={e => updateScene(activeScene.id, 'accentColor', e.target.value)} 
                                />
                            </div>
                        </Field>
                        <Field label="Lottie URL (R2)">
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input 
                                    style={{ ...inputStyle, flex: 1 }} 
                                    value={activeScene.animationUrl || ''} 
                                    onChange={e => updateScene(activeScene.id, 'animationUrl', e.target.value)} 
                                    placeholder="ยังไม่มีไฟล์ (ใช้ Default ถ้าเว้นว่าง)"
                                />
                                <label style={{ 
                                    background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 10,
                                    padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6,
                                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#475569'
                                }}>
                                    <Upload size={16} /> อัปโหลด JSON
                                    <input 
                                        type="file" 
                                        accept=".json" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => handleFileUpload(e, activeScene.id)} 
                                        disabled={uploadingId === activeScene.id}
                                    />
                                </label>
                            </div>
                            {uploadingId === activeScene.id && <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: 6 }}>กำลังอัปโหลด...</div>}
                        </Field>
                    </div>

                    <Field label="พรีวิวฉาก">
                        <div style={{ 
                            height: 240, borderRadius: 16, overflow: 'hidden', position: 'relative',
                            border: `2px solid ${activeScene.accentColor}`
                        }}>
                            <div style={{ position: 'absolute', inset: 0, background: activeScene.bgGradient }} />
                            
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
                                {activeScene.animationUrl ? (
                                    <AdaptiveLottie
                                        animationUrl={activeScene.animationUrl}
                                        loop autoplay
                                        scale="none"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                        (ไม่มี Custom Lottie, จะใช้ Default ของเกม)
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ position: 'absolute', inset: 0, background: activeScene.overlayTint }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
                            
                            <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '2rem' }}>{activeScene.emoji}</span>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>พรีวิวบรรยากาศ</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{activeScene.name}</div>
                                </div>
                            </div>
                        </div>
                    </Field>
                </div>
            )}
        </div>
    );
};

export default JourneySceneManager;
