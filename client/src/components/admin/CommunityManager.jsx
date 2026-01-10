import React from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const CommunityManager = () => {
    // Mock data for now
    const reports = [
        { id: 1, type: 'Comment', content: 'Spam content here', reporter: 'user1', status: 'pending' },
        { id: 2, type: 'Thread', content: 'Inappropriate title', reporter: 'user2', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">ดูแลชุมชน (Moderation)</h2>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        {report.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{report.content}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reporter}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button className="text-green-600 hover:text-green-900" title="Keep">
                                        <CheckCircle className="h-5 w-5" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900" title="Delete & Ban">
                                        <XCircle className="h-5 w-5" />
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

export default CommunityManager;
