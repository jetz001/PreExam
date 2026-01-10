import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Edit, Trash2, Shield, ShieldOff, UserCheck, UserX, CreditCard, Wallet } from 'lucide-react';

const MemberManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (id, data) => {
        try {
            await api.put(`/admin/users/${id}`, data);
            fetchUsers();
        } catch (error) {
            alert('Failed to update user');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">จัดการสมาชิก</h2>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {user.display_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.plan_type === 'premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.plan_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleUpdateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title="Toggle Admin"
                                    >
                                        {user.role === 'admin' ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateUser(user.id, { plan_type: user.plan_type === 'premium' ? 'free' : 'premium' })}
                                        className="text-green-600 hover:text-green-900"
                                        title="Toggle Premium"
                                    >
                                        {user.plan_type === 'premium' ? <Wallet className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateUser(user.id, { status: user.status === 'active' ? 'banned' : 'active' })}
                                        className="text-red-600 hover:text-red-900"
                                        title="Ban/Unban"
                                    >
                                        {user.status === 'active' ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberManager;
