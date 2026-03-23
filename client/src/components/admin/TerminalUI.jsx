import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Send, ChevronRight } from 'lucide-react';
import axios from 'axios';

const TerminalUI = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: '--- PreExam AI Virtual Terminal v1.1.0 ---' },
    { type: 'system', content: '>>> Welcome, Admin. System is ready.' },
    { type: 'system', content: '>>> Type "help" to see available commands.' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState('Google Gemini');
  const scrollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/terminal/command', 
        { command: 'status' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Extract provider name from status message like ">>> Status: Idle (Active Provider: Google Gemini)"
      const match = response.data.message.match(/Active Provider: (.*)\)/) || response.data.message.match(/Using (.*)\.\.\./);
      if (match) setActiveProvider(match[1]);
    } catch (err) {
      console.error('Failed to fetch terminal status', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'user', content: cmd }]);
    setInput('');

    // Handle common shell commands with a helpful message
    const cmdLower = cmd.toLowerCase();
    if (cmdLower.startsWith('node ') || cmdLower.startsWith('npm ') || cmdLower.startsWith('cd ') || cmdLower.startsWith('ls ')) {
        setHistory(prev => [...prev, { 
            type: 'error', 
            content: `This is a Virtual Terminal for AI Control, not a real OS shell.\nPlease use "gen [prompt]" to generate questions.\nExample: gen ออกข้อสอบวิชาภาษาไทย 1 ข้อ` 
        }]);
        return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/terminal/command', 
        { command: cmd },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHistory(prev => [...prev, { 
        type: 'bot', 
        content: response.data.message || 'Command executed.' 
      }]);

      // If switched provider, update the indicator
      if (cmd.toLowerCase().startsWith('use ')) {
        const match = response.data.message.match(/Switched to Provider: (.*)\n/);
        if (match) setActiveProvider(match[1]);
      }
    } catch (error) {
      setHistory(prev => [...prev, { 
        type: 'error', 
        content: error.response?.data?.message || 'Error executing command. (Quota might be exceeded)' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-700 font-mono text-sm h-[400px] flex flex-col">
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-emerald-400" />
          <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">AI Virtual Terminal</span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-sky-400 border border-slate-600">
            Engine: {activeProvider}
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar"
      >
        {history.map((line, i) => (
          <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
            {line.type === 'user' && <span className="text-emerald-400 font-bold">$</span>}
            {line.type === 'bot' && <span className="text-sky-400">🤖</span>}
            {line.type === 'error' && <span className="text-rose-500">❌</span>}
            <pre className={`whitespace-pre-wrap break-all ${
              line.type === 'user' ? 'text-slate-100' :
              line.type === 'error' ? 'text-rose-400' :
              line.type === 'bot' ? 'text-sky-300' :
              'text-emerald-500/80'
            }`}>
              {line.content}
            </pre>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 italic animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
            <span>AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <form 
        onSubmit={handleCommand}
        className="bg-slate-950/50 p-3 border-t border-slate-700/50 flex items-center gap-2"
      >
        <ChevronRight size={18} className="text-emerald-500" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command (e.g. gen ออกข้อสอบ Tense)..."
          className="bg-transparent border-none outline-none flex-1 text-slate-100 placeholder:text-slate-600 disabled:opacity-50"
          autoFocus
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors disabled:opacity-0"
        >
          <Send size={16} />
        </button>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default TerminalUI;
