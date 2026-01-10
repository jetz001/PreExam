import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import studyGroupService from '../../services/studyGroupService';
import { useAuth } from '../../context/AuthContext';
import GroupChatRoom from './GroupChatRoom';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import toast from 'react-hot-toast';

const StudyGroupList = ({ compact = false }) => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const fetchGroups = async () => {
        try {
            const data = await studyGroupService.getMyGroups();
            setGroups(data.data || []);
        } catch (error) {
            console.error("Failed to fetch groups");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, groupId) => {
        e.stopPropagation();
        if (window.confirm("คุณแน่ใจหรือไม่ที่จะปิดกลุ่มนี้? การกระทำนี้ไม่สามารถยกเลิกได้")) {
            try {
                await studyGroupService.deleteGroup(groupId);
                toast.success("ปิดกลุ่มเรียบร้อยแล้ว");
                fetchGroups();
                if (selectedGroup?.id === groupId) setSelectedGroup(null);
            } catch (error) {
                toast.error("ไม่สามารถปิดกลุ่มได้");
            }
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className={`flex justify-between items-center ${compact ? 'mb-4' : 'mb-6'}`}>
                    <h3 className="text-lg font-bold">กลุ่มติวหนังสือ</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setShowJoinModal(true)} className={`bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2 ${compact ? 'p-2' : 'px-3 py-2'}`}>
                            <Search size={16} /> {compact ? '' : 'ค้นหากลุ่ม'}
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className={`bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 ${compact ? 'p-2' : 'px-4 py-2'}`}>
                            <Plus size={16} /> {compact ? '' : 'สร้างกลุ่ม'}
                        </button>
                    </div>
                </div>

                <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 gap-4'}`}>
                    {groups.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">ยังไม่เข้าร่วมกลุ่มติวเลย ลองหาหรือสร้างกลุ่มดูสิ!</p>
                    ) : (
                        groups.map(group => (
                            <div key={group.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center border rounded-xl dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition ${compact ? 'p-2' : 'p-4'}`}>
                                <div className="flex items-center gap-3 mb-2 md:mb-0 w-full overflow-hidden">
                                    <div className={`flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center ${compact ? 'w-10 h-10' : 'w-12 h-12'}`}>
                                        <Users size={compact ? 20 : 24} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className={`font-bold text-gray-800 dark:text-white truncate ${compact ? 'text-sm' : 'text-lg'}`} title={group.name}>
                                            {group.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate" title={group.subject}>
                                            {group.subject} • {group.memberCount} สมาชิก
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex gap-2 w-full md:w-auto ${compact ? 'mt-1' : 'mt-2'} md:mt-0`}>
                                    <button
                                        onClick={() => setSelectedGroup(group)}
                                        className={`flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'}`}
                                    >
                                        <MessageCircle size={compact ? 14 : 18} /> {compact ? 'แชท' : 'เข้าสู่ห้องแชท'}
                                    </button>
                                    {(user?.id === group.owner_id || user?.role === 'admin') && (
                                        <button
                                            onClick={(e) => handleDelete(e, group.id)}
                                            className={`bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}
                                            title="ปิดกลุ่ม"
                                        >
                                            <Trash2 size={compact ? 14 : 18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedGroup && (
                <GroupChatRoom group={selectedGroup} onClose={() => setSelectedGroup(null)} />
            )}

            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onGroupCreated={fetchGroups}
                />
            )}

            {showJoinModal && (
                <JoinGroupModal
                    onClose={() => setShowJoinModal(false)}
                    onGroupJoined={() => {
                        fetchGroups();
                        // Optional: close join modal or keep open to join more
                    }}
                />
            )}
        </>
    );
};

export default StudyGroupList;
