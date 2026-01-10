import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Flag, MessageSquare, Trash2, Ban, CheckCircle } from 'lucide-react';
import adminApi from '../../services/adminApi';

const InboxManager = () => {
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'reports'

    const { data: messages = [] } = useQuery({
        queryKey: ['messages'],
        queryFn: adminApi.getMessages,
        enabled: activeTab === 'inbox'
    });

    const { data: reports = [] } = useQuery({
        queryKey: ['reports'],
        queryFn: adminApi.getReports,
        enabled: activeTab === 'reports'
    });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Inbox & Reports</h2>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'inbox' ? 'text-royal-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center">
                        <Mail size={18} className="mr-2" />
                        Inbox
                    </div>
                    {activeTab === 'inbox' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-royal-blue-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'reports' ? 'text-red-500' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center">
                        <Flag size={18} className="mr-2" />
                        Reported Content
                    </div>
                    {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
                {activeTab === 'inbox' ? (
                    <div className="divide-y divide-slate-100">
                        {messages.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No new messages.</div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <span className={`px-2 py-0.5 text-xs rounded font-medium mr-2 
                                                ${msg.type === 'Sponsor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {msg.type}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">{msg.subject}</span>
                                            <span className="text-xs text-slate-400 ml-auto md:hidden">{msg.from}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-2">{msg.content}</p>
                                        <p className="text-xs text-slate-400">From: {msg.from}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Reply">
                                            <MessageSquare size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-100 rounded text-red-500" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {reports.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No reports requiring attention.</div>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id} className="p-6 hover:bg-red-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded font-medium mr-2">
                                                Reported {report.type}
                                            </span>
                                            <span className="text-xs text-slate-400">Reported by: {report.reporter}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-2">
                                            <p className="text-slate-700 text-sm italic">"{report.content}"</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium flex items-center">
                                            <CheckCircle size={14} className="mr-1" /> Keep
                                        </button>
                                        <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium flex items-center">
                                            <Trash2 size={14} className="mr-1" /> Remove
                                        </button>
                                        <button className="px-3 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-900 text-xs font-medium flex items-center">
                                            <Ban size={14} className="mr-1" /> Ban User
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxManager;
