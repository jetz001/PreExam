import React, { useEffect, useState, useRef } from 'react';
import chatApi from '../../services/chatApi';

const ProfileMessages = ({ user }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const fetchConversations = async () => {
        try {
            const data = await chatApi.getInboxConversations();
            setConversations(data || []);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSelectChat = async (friend) => {
        setActiveChat(friend);
        setLoadingMessages(true);
        try {
            const msgs = await chatApi.getMessages(friend.id);
            setMessages(msgs || []);
            await chatApi.markRead(friend.id);
            
            // Mark locally as read
            setConversations(prev => prev.map(c => 
                c.friend.id === friend.id ? { ...c, isRead: true } : c
            ));
        } catch (err) {
            console.error('Error fetching chat history:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat) return;

        const currentText = inputText;
        setInputText('');
        
        // Optimistic update
        const tempMsg = {
            id: 'temp_' + Date.now(),
            sender_id: user?.id, // Assumes we can identify our own messages
            content: currentText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const newMsg = await chatApi.sendMessage(activeChat.id, currentText);
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? newMsg : m));
            fetchConversations(); // refresh inbox order
        } catch (err) {
            console.error('Error sending message:', err);
            // Revert optimistic update
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        }
    };

    return (
        <div id="sec-messages" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px', flexShrink: 0 }}>
                <div className="dot"></div>📩 กล่องข้อความ
            </div>
            
            <div style={{ display: 'flex', flex: 1, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', overflow: 'hidden', minHeight: '400px' }}>
                
                {/* Left Sidebar - Conversations */}
                <div style={{ width: '300px', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 800 }}>แชททั้งหมด</div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {loading ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading...</div>
                        ) : conversations.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {conversations.map((conv) => (
                                    <div 
                                        key={conv.friend.id} 
                                        onClick={() => handleSelectChat(conv.friend)}
                                        style={{ 
                                            display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', 
                                            borderRadius: '12px', cursor: 'pointer',
                                            background: activeChat?.id === conv.friend.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                        className="chat-conv-item"
                                    >
                                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff7700,#e21b3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                            {conv.friend?.avatar ? <img src={conv.friend.avatar.startsWith('http') ? conv.friend.avatar : `https://preexam.online${conv.friend.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '😎'}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <span style={{ fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{conv.friend?.display_name || 'User'}</span>
                                                {!conv.isRead && conv.lastMessage?.sender_id !== user?.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--k-yellow)' }}></span>}
                                            </div>
                                            <div style={{ fontSize: '12px', color: !conv.isRead && conv.lastMessage?.sender_id !== user?.id ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                {conv.lastMessage?.sender_id === user?.id ? 'คุณ: ' : ''}{conv.lastMessage?.content || 'Sent an attachment'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📬</div>
                                <div style={{ fontSize: '13px' }}>ยังไม่มีข้อความ</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area - Active Chat */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--k-bg)' }}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff7700,#e21b3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {activeChat.avatar ? <img src={activeChat.avatar.startsWith('http') ? activeChat.avatar : `https://preexam.online${activeChat.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '😎'}
                                </div>
                                <div style={{ fontWeight: 800 }}>{activeChat.display_name || 'User'}</div>
                            </div>

                            {/* Messages Area */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {loadingMessages ? (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading messages...</div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg, i) => {
                                        // Simple way to check if my message: if I sent it, or if sender_id !== activeChat.id (fallback)
                                        const isMine = msg.sender_id !== activeChat.id;
                                        return (
                                            <div key={msg.id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                                <div style={{ 
                                                    maxWidth: '70%', 
                                                    padding: '10px 15px', 
                                                    borderRadius: '16px', 
                                                    borderBottomRightRadius: isMine ? '4px' : '16px',
                                                    borderBottomLeftRadius: isMine ? '16px' : '4px',
                                                    background: isMine ? 'var(--k-yellow)' : 'rgba(255,255,255,0.1)',
                                                    color: isMine ? '#1a0533' : '#fff',
                                                    fontSize: '14px',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {msg.content}
                                                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: isMine ? 'right' : 'left' }}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        เริ่มคุยกับ {activeChat.display_name} เลย!
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                <input 
                                    type="text" 
                                    placeholder="พิมพ์ข้อความ..." 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }}
                                />
                                <button type="submit" disabled={!inputText.trim()} style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--k-yellow)', border: 'none', color: '#1a0533', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', opacity: inputText.trim() ? 1 : 0.5 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                            <div style={{ fontSize: '16px', fontWeight: 800 }}>เลือกเพื่อนเพื่อเริ่มแชท</div>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                .chat-conv-item:hover { background: rgba(255,255,255,0.05) !important; }
            `}</style>
        </div>
    );
};

export default ProfileMessages;
