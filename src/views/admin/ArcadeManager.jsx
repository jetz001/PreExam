import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';

export default function ArcadeManager() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentData, setCurrentData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        game_url: '',
        internal_component: '',
        mode: 'both',
        is_active: true,
        order_index: 0
    });
    const [isEdit, setIsEdit] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const handleUploadCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingCover(true);
        const formData = new FormData();
        formData.append('file', file);
        
        const ext = file.name.split('.').pop();
        const filename = `arcade_thumb_${currentData.id || Date.now()}.${ext}`;
        formData.append('exactName', filename);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Append timestamp to bust cache if replacing
            setCurrentData({ ...currentData, thumbnail_url: `${res.data.url}?t=${Date.now()}` });
            toast.success('อัปโหลดรูปลง R2 สำเร็จ');
        } catch (err) {
            console.error('Upload Error:', err);
            toast.error(`อัปโหลดล้มเหลว: ${err.response?.data?.error || err.message}`);
        } finally {
            setUploadingCover(false);
            e.target.value = ''; // Reset input
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const res = await adminService.getArcadeGames();
            if (res.success) {
                setGames(res.data);
            }
        } catch (error) {
            toast.error('Failed to load arcade games');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await adminService.updateArcadeGame(currentData.id, currentData);
                toast.success('อัปเดตเกมสำเร็จ');
            } else {
                await adminService.createArcadeGame(currentData);
                toast.success('เพิ่มเกมสำเร็จ');
            }
            setIsModalOpen(false);
            fetchGames();
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบเกมนี้?')) return;
        try {
            await adminService.deleteArcadeGame(id);
            toast.success('ลบเกมสำเร็จ');
            fetchGames();
        } catch (error) {
            toast.error('ลบเกมไม่สำเร็จ');
        }
    };

    const openCreateModal = () => {
        setIsEdit(false);
        setCurrentData({
            title: '', description: '', thumbnail_url: '', game_url: '', internal_component: '', mode: 'both', is_active: true, order_index: 0
        });
        setIsModalOpen(true);
    };

    const openEditModal = (game) => {
        setIsEdit(true);
        setCurrentData(game);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">🎮 Arcade Manager</h2>
                    <p className="text-gray-500">จัดการมินิเกมในระบบ</p>
                </div>
                <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    + เพิ่มมินิเกมใหม่
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ/ชื่อเกม</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โหมด</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทที่มา</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {games.map((g) => (
                                <tr key={g.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900 bg-gray-100 w-6 h-6 flex items-center justify-center rounded mr-2">{g.order_index}</div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{g.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{g.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            g.mode === 'solo' ? 'bg-green-100 text-green-800' :
                                            g.mode === 'multi' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {g.mode.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {g.internal_component ? (
                                            <span className="text-indigo-600 font-bold">🛠️ สร้างเอง ({g.internal_component})</span>
                                        ) : g.game_url ? (
                                            <span className="text-gray-500">🔗 ฝังลิงก์ (iframe)</span>
                                        ) : (
                                            <span className="text-red-500">⚠️ ไม่มีข้อมูล</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {g.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(g)} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</button>
                                        <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                                    </td>
                                </tr>
                            ))}
                            {games.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลเกม</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">{isEdit ? 'แก้ไขมินิเกม' : 'เพิ่มมินิเกมใหม่'}</h3>
                        <form onSubmit={handleSave}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">ชื่อเกม</label>
                                    <input required type="text" value={currentData.title} onChange={e => setCurrentData({...currentData, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                                    <textarea value={currentData.description} onChange={e => setCurrentData({...currentData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="2"></textarea>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">URL รูปปก (Thumbnail) หรือ อัปโหลดลง R2</label>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <input type="text" value={currentData.thumbnail_url} onChange={e => setCurrentData({...currentData, thumbnail_url: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="https://..." />
                                        <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition whitespace-nowrap">
                                            {uploadingCover ? 'กำลังอัปโหลด...' : 'อัปโหลดปก'}
                                            <input type="file" accept="image/*,.json,.lottie" className="hidden" onChange={handleUploadCover} disabled={uploadingCover} />
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="col-span-2 border-t pt-4 mt-2">
                                    <p className="text-xs text-gray-500 mb-2 font-bold">วิธีเชื่อมต่อตัวเกม (เลือกอย่างใดอย่างหนึ่ง)</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">1. ลิงก์ไฟล์เกม Open Source (ที่อัปโหลดไว้ในเซิร์ฟเวอร์เรา)</label>
                                    <input type="text" value={currentData.game_url} onChange={e => setCurrentData({...currentData, game_url: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="เช่น /games/memory-match/index.html" />
                                    <p className="text-xs text-gray-400 mt-1">ใช้สำหรับเกม HTML5 Open source ที่นำมาวางในโฟลเดอร์ public/games/</p>
                                </div>
                                <div className="col-span-2 text-center text-xs text-gray-400 font-bold">-- หรือ --</div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">2. ชื่อ React Component (ถ้าสร้างเกมเป็นระบบฝังในเว็บเลย)</label>
                                    <input type="text" value={currentData.internal_component} onChange={e => setCurrentData({...currentData, internal_component: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="เช่น WordMatchGame" />
                                </div>

                                <div className="col-span-2 border-t pt-4 mt-2"></div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">โหมดการเล่น</label>
                                    <select value={currentData.mode} onChange={e => setCurrentData({...currentData, mode: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                        <option value="both">เล่นได้ทั้งหมด (Both)</option>
                                        <option value="solo">เล่นคนเดียว (Solo)</option>
                                        <option value="multi">เล่นหลายคน (Multi)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ลำดับการแสดงผล</label>
                                    <input type="number" value={currentData.order_index} onChange={e => setCurrentData({...currentData, order_index: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div className="col-span-2 flex items-center mt-2">
                                    <input type="checkbox" id="isActive" checked={currentData.is_active} onChange={e => setCurrentData({...currentData, is_active: e.target.checked})} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">เปิดใช้งาน (Active)</label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2">ยกเลิก</button>
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
