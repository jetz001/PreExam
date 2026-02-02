import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Shield, Ban, CheckCircle, Briefcase, GraduationCap, Lock, X, Smartphone, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const isGuest = (user) => {
    return (user.email && user.email.startsWith('guest_') && user.email.includes('@preexam.com')) ||
        (user.display_name && user.display_name.startsWith('Guest-'));
};

const isForeignGuest = (user) => {
    return isGuest(user) && user.country && user.country !== 'TH';
};

const PERMISSIONS_LIST = [
    { id: 'view_dashboard', label: 'View Dashboard' },
    { id: 'manage_exams', label: 'Manage Questions' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_news', label: 'Manage News' },
    { id: 'manage_community', label: 'Manage Community' },
    { id: 'manage_inbox', label: 'Inbox & Reports' },
    { id: 'manage_payments', label: 'Payment Verification' },
    { id: 'manage_assets', label: 'Manage Themes/Assets' },
    { id: 'manage_legal', label: 'Manage Legal/PDPA' },
];

const PermissionsModal = ({ user, onClose, onSave }) => {
    const [selectedPermissions, setSelectedPermissions] = useState(user.admin_permissions || []);

    const togglePermission = (id) => {
        if (selectedPermissions.includes(id)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== id));
        } else {
            setSelectedPermissions([...selectedPermissions, id]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                        Admin Permissions: {user.display_name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-500 mb-4">Select the modules this admin can access.</p>
                    <div className="space-y-2">
                        {PERMISSIONS_LIST.map((perm) => (
                            <label key={perm.id} className="flex items-center p-2 hover:bg-gray-50 rounded border border-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500 mr-3 h-4 w-4"
                                />
                                <span className="text-sm text-gray-700 font-medium">{perm.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                    <button
                        onClick={() => onSave(user.id, selectedPermissions)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
                    >
                        Save Permissions
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddAdminModal = ({ users, onClose, onPromote }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);

    const nonAdminUsers = users.filter(u => u.role !== 'admin' && u.role !== 'sponsor');
    const displayUsers = nonAdminUsers.filter(u =>
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.display_name && u.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">เพิ่มผู้ดูแลใหม่</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ หรือ อีเมล..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {displayUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No users found.</p>
                    ) : (
                        displayUsers.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3 flex-shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-medium text-slate-800 truncate">{user.display_name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                {selectedUserId === user.id && <CheckCircle size={16} className="ml-auto text-indigo-600" />}
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                    <button
                        disabled={!selectedUserId}
                        onClick={() => onPromote(selectedUserId)}
                        className={`px-4 py-2 rounded-lg font-medium shadow-sm ${selectedUserId ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        ยืนยันการตั้งค่า
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserManager = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('users');
    const [editingPermissionsUser, setEditingPermissionsUser] = useState(null);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: adminApi.getUsers
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('User updated successfully');
        },
        onError: () => toast.error('Failed to update user')
    });

    const updatePermissionsMutation = useMutation({
        mutationFn: ({ id, permissions }) => adminApi.updateUserPermissions(id, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setEditingPermissionsUser(null);
            toast.success('Permissions updated');
        },
        onError: () => toast.error('Failed to update permissions')
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries(['users']);
            const previousUsers = queryClient.getQueryData(['users']);
            queryClient.setQueryData(['users'], (old) =>
                old ? old.map(u => u.id === id ? { ...u, status } : u) : []
            );
            return { previousUsers };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['users'], context.previousUsers);
            toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['users']);
        },
        onSuccess: (data, variables) => {
            toast.success(`User ${variables.status === 'banned' ? 'banned' : 'activated'} successfully`);
        }
    });

    const handleUpgrade = (id) => {
        if (window.confirm('Manually upgrade this user to Premium?')) {
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            updateUserMutation.mutate({
                id,
                data: {
                    plan_type: 'premium',
                    premium_start_date: new Date(),
                    premium_expiry: oneMonthFromNow
                }
            });
        }
    };

    const handleStatusChange = (id, currentStatus) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        const action = newStatus === 'banned' ? 'Ban' : 'Activate';

        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            statusMutation.mutate({ id, status: newStatus });
        }
    };

    const handleDemote = (id) => {
        if (window.confirm('Are you sure you want to remove Admin privileges from this user?')) {
            updateUserMutation.mutate({ id, data: { role: 'user' } });
        }
    };

    const handlePromoteAdmin = (id) => {
        if (window.confirm('Promote this user to Admin?')) {
            updateUserMutation.mutate({ id, data: { role: 'admin' } });
            setIsAddAdminModalOpen(false);
        }
    };

    const handleSavePermissions = (id, permissions) => {
        updatePermissionsMutation.mutate({ id, permissions });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Category Counts
    const counts = {
        users: users.filter(u => u.role !== 'admin' && u.role !== 'sponsor' && !isGuest(u)).length,
        guests: users.filter(u => isGuest(u) && !isForeignGuest(u)).length, // Local/Unknown Guests
        foreignGuests: users.filter(u => isForeignGuest(u)).length, // Foreign Guests
        sponsors: users.filter(u => u.role === 'sponsor').length,
        admins: users.filter(u => u.role === 'admin').length
    };

    const filteredUsers = users.filter(user => {
        // Tab Filter
        if (activeTab === 'sponsors' && user.role !== 'sponsor') return false;
        if (activeTab === 'admins' && user.role !== 'admin') return false;

        // Split Guests
        if (activeTab === 'guests') {
            if (!isGuest(user) || isForeignGuest(user)) return false;
        }
        if (activeTab === 'foreign_guests') {
            if (!isForeignGuest(user)) return false;
        }

        if (activeTab === 'users' && (user.role === 'sponsor' || user.role === 'admin' || isGuest(user))) return false;

        // Search Filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = (user.name || user.display_name || '').toLowerCase().includes(searchLower);
            const matchesEmail = (user.email || '').toLowerCase().includes(searchLower);
            const matchesBusiness = (user.business_name || '').toLowerCase().includes(searchLower);

            if (!matchesName && !matchesEmail && !matchesBusiness) return false;
        }

        // Status Filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'banned' && user.status !== 'banned') return false;
            // Assuming 'active' mimics non-banned for now, or specific status check
            if (filterStatus === 'active' && user.status === 'banned') return false;
        }

        return true;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ หรือ อีเมล..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="active">ปกติ (Active)</option>
                            <option value="banned">ถูกระงับ (Banned)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <Shield className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                    {activeTab === 'admins' && (
                        <button
                            onClick={() => setIsAddAdminModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Shield size={16} className="mr-2" />
                            เพิ่มผู้ดูแล
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-slate-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-1 flex items-center space-x-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <GraduationCap size={18} />
                    <span>ผู้ใช้งาน ({counts.users})</span>
                </button>
                <button
                    onClick={() => setActiveTab('guests')}
                    className={`pb-3 px-1 flex items-center space-x-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'guests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Smartphone size={18} />
                    <span>Guest ({counts.guests})</span>
                </button>
                <button
                    onClick={() => setActiveTab('foreign_guests')}
                    className={`pb-3 px-1 flex items-center space-x-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'foreign_guests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Globe size={18} />
                    <span>Guest Inter ({counts.foreignGuests})</span>
                </button>
                <button
                    onClick={() => setActiveTab('sponsors')}
                    className={`pb-3 px-1 flex items-center space-x-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'sponsors' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Briefcase size={18} />
                    <span>ผู้สนับสนุน ({counts.sponsors})</span>
                </button>
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`pb-3 px-1 flex items-center space-x-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'admins' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Shield size={18} />
                    <span>ผู้ดูแลระบบ ({counts.admins})</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">
                                    {activeTab === 'sponsors' ? 'ข้อมูลธุรกิจ' : 'ข้อมูลผู้ใช้'}
                                </th>
                                <th className="px-6 py-4 font-semibold">สถานะ/บทบาท</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">สถานะบัญชี</th>
                                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No {activeTab.replace('_', ' ')} found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.display_name}
                                                        className="w-8 h-8 rounded-full object-cover mr-3 shadow-sm border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-500 mr-3 ${activeTab === 'sponsors' ? 'bg-indigo-100 text-indigo-600' :
                                                        activeTab === 'admins' ? 'bg-purple-100 text-purple-600' :
                                                            (activeTab === 'guests' || activeTab === 'foreign_guests') ? 'bg-gray-100 text-gray-500' : 'bg-slate-200'
                                                        }`}>
                                                        {activeTab === 'sponsors' ? <Briefcase size={16} /> :
                                                            activeTab === 'admins' ? <Shield size={16} /> :
                                                                (activeTab === 'guests' || activeTab === 'foreign_guests') ? <Smartphone size={16} /> : <User size={16} />}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {activeTab === 'sponsors'
                                                            ? (user.business_name || user.display_name || 'Unknown Business')
                                                            : (user.name || user.display_name || 'Unknown')}
                                                    </p>
                                                    {activeTab === 'sponsors' && user.display_name && (
                                                        <p className="text-xs text-indigo-600 font-medium">
                                                            Owner: {user.display_name}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold flex items-center w-fit">
                                                        <Shield size={12} className="mr-1" /> Admin
                                                    </span>
                                                    {user.admin_permissions && user.admin_permissions.length > 0 && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {user.admin_permissions.length} Permissions
                                                        </span>
                                                    )}
                                                </div>
                                            ) : user.plan_type === 'premium' ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold flex items-center w-fit">
                                                    <CheckCircle size={12} className="mr-1" /> Premium
                                                </span>
                                            ) : user.role === 'sponsor' ? (
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold flex items-center w-fit">
                                                    <Briefcase size={12} className="mr-1" /> Sponsor
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs flex items-center w-fit">
                                                    Free User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-800">
                                                {user.city ? `${user.city}, ${user.country}` : (user.country || '-')}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">{user.ip_address || ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs 
                                                ${user.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {user.role === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => setEditingPermissionsUser(user)}
                                                        className="text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded transition-colors text-xs font-medium border border-slate-200 flex items-center inline-flex"
                                                    >
                                                        <Lock size={12} className="mr-1" /> กำหนดสิทธิ์
                                                    </button>
                                                    <button
                                                        onClick={() => handleDemote(user.id)}
                                                        className="text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded transition-colors text-xs font-medium border border-orange-200 flex items-center inline-flex"
                                                    >
                                                        <User size={12} className="mr-1" /> ลดระดับ
                                                    </button>
                                                </>
                                            )}
                                            {user.role !== 'admin' && user.plan_type !== 'premium' && user.role !== 'sponsor' && (
                                                <button
                                                    onClick={() => handleUpgrade(user.id)}
                                                    className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors text-xs font-medium border border-indigo-200"
                                                >
                                                    Upgrade to Premium
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleStatusChange(user.id, user.status)}
                                                className={`${user.status === 'banned'
                                                    ? 'text-green-600 hover:bg-green-50 border-green-200'
                                                    : 'text-red-500 hover:bg-red-50 border-red-200'} px-3 py-1.5 rounded transition-colors text-xs font-medium border flex items-center inline-flex`}
                                            >
                                                {user.status === 'banned' ? (
                                                    <><CheckCircle size={12} className="mr-1" /> ปลดแบน</>
                                                ) : (
                                                    <><Ban size={12} className="mr-1" /> ระงับใช้งาน</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {
                isAddAdminModalOpen && (
                    <AddAdminModal
                        users={users}
                        onClose={() => setIsAddAdminModalOpen(false)}
                        onPromote={handlePromoteAdmin}
                    />
                )
            }

            {
                editingPermissionsUser && (
                    <PermissionsModal
                        user={editingPermissionsUser}
                        onClose={() => setEditingPermissionsUser(null)}
                        onSave={handleSavePermissions}
                    />
                )
            }
        </div >
    );
};

export default UserManager;
