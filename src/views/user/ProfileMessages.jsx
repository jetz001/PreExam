import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { Mail, User, Inbox, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import chatApi from '../../services/chatApi';

const ProfileMessages = ({ user }) => {
  const outletContext = useOutletContext() || {};
  const currentUser = user || outletContext.user;
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  async function handleSelectChat(friend) {
    setActiveChat(friend);
    setLoadingMessages(true);
    try {
      const msgs = await chatApi.getMessages(friend.id);
      setMessages(msgs || []);
      await chatApi.markRead(friend.id);

      setConversations((prev) =>
        prev.map((c) => (c.friend.id === friend.id ? { ...c, isRead: true } : c))
      );
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoadingMessages(false);
    }
  }

  const fetchConversations = async () => {
    try {
      const data = await chatApi.getInboxConversations();
      let finalData = data || [];

      if (location.state?.friend) {
        const targetFriend = location.state.friend;
        const exists = finalData.find((c) => c.friend.id === targetFriend.id);
        if (!exists) {
          finalData = [
            {
              friend: targetFriend,
              lastMessage: { content: 'เริ่มบทสนทนาใหม่' },
              isRead: true,
            },
            ...finalData,
          ];
        }
        if (!activeChat) {
          handleSelectChat(targetFriend);
        }
      }

      setConversations(finalData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [location.state?.friend]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const currentText = inputText;
    setInputText('');

    const tempMsg = {
      id: 'temp_' + Date.now(),
      sender_id: currentUser?.id,
      content: currentText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const newMsg = await chatApi.sendMessage(activeChat.id, currentText);
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? newMsg : m)));
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
  };

  return (
    <div id="sec-messages" className="flex flex-col" style={{ height: 'calc(100vh - 124px)' }}>
      <div className="section-title shrink-0" style={{ marginBottom: '16px', fontSize: '20px' }}>
        <div className="dot" />
        <Mail size={20} className="text-amber-300" />
        <span>กล่องข้อความ</span>
      </div>

      <div className="flex flex-1 min-h-[420px] overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
        {/* Left Sidebar - Conversations */}
        <div
          className={`${
            activeChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-72 lg:w-80 shrink-0 flex-col border-r border-white/15 bg-black/25`}
        >
          <div className="border-b border-white/15 px-4 py-3.5 text-sm font-black text-white">
            แชททั้งหมด
          </div>
          <div className="flex-1 overflow-y-auto p-2.5">
            {loading ? (
              <div className="py-6 text-center text-sm text-white/70 font-semibold">กำลังโหลด...</div>
            ) : conversations.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {conversations.map((conv) => {
                  const isActive = activeChat?.id === conv.friend.id;
                  const isUnread = !conv.isRead && conv.lastMessage?.sender_id !== currentUser?.id;
                  return (
                    <button
                      type="button"
                      key={conv.friend.id}
                      onClick={() => handleSelectChat(conv.friend)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                        isActive ? 'bg-white/15 border border-white/20' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white border border-white/25">
                        {conv.friend?.avatar ? (
                          <img
                            src={
                              conv.friend.avatar.startsWith('http')
                                ? conv.friend.avatar
                                : `https://preexam.online${conv.friend.avatar}`
                            }
                            alt={conv.friend?.display_name || 'Avatar'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-extrabold text-white">
                            {conv.friend?.display_name || 'User'}
                          </span>
                          {isUnread && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                          )}
                        </div>
                        <div
                          className={`truncate text-xs ${
                            isUnread ? 'font-bold text-white' : 'text-white/70'
                          }`}
                        >
                          {conv.lastMessage?.sender_id === currentUser?.id ? 'คุณ: ' : ''}
                          {conv.lastMessage?.content || 'Sent an attachment'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-white/70">
                <Inbox size={28} className="mx-auto mb-2 opacity-60" />
                <div className="text-xs font-semibold">ยังไม่มีข้อความ</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Active Chat */}
        <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#2d0d6b]/60`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-white/15 bg-white/5 px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => setActiveChat(null)}
                  aria-label="กลับไปยังรายการแชท"
                  className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white border border-white/25">
                  {activeChat.avatar ? (
                    <img
                      src={
                        activeChat.avatar.startsWith('http')
                          ? activeChat.avatar
                          : `https://preexam.online${activeChat.avatar}`
                      }
                      alt={activeChat.display_name || 'Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="font-extrabold text-white truncate">
                  {activeChat.display_name || 'User'}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
                {loadingMessages ? (
                  <div className="py-8 text-center text-sm text-white/70 font-semibold">
                    กำลังโหลดข้อความ...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, i) => {
                    const isMine = msg.sender_id !== activeChat.id;
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                            isMine
                              ? 'rounded-br-sm bg-amber-300 text-slate-950 font-semibold'
                              : 'rounded-bl-sm bg-white/15 text-white border border-white/15'
                          }`}
                        >
                          <div>{msg.content}</div>
                          <div
                            className={`mt-1 text-[10px] opacity-75 ${
                              isMine ? 'text-right' : 'text-left'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="m-auto text-center text-sm text-white/70 font-semibold">
                    เริ่มคุยกับ {activeChat.display_name} เลย!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2.5 border-t border-white/15 bg-white/5 p-3 sm:p-4"
              >
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความ..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  aria-label="พิมพ์ข้อความ"
                  className="flex-1 rounded-full border border-white/20 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  aria-label="ส่งข้อความ"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md transition-transform hover:scale-105 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white/75">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-amber-300">
                <MessageSquare size={30} />
              </div>
              <div className="text-base font-black text-white">เลือกเพื่อนเพื่อเริ่มแชท</div>
              <div className="mt-1 text-xs text-white/65">
                เลือกบทสนทนาจากแถบด้านซ้ายเพื่ออ่านและส่งข้อความ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMessages;
