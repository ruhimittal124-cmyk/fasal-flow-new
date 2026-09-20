import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, PhoneCall, CheckCheck, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';

interface ChatViewProps {
  setCurrentTab: (tab: string) => void;
}

interface Conversation {
  id: string;
  partnerName: string;
  partnerRole: string;
  partnerDistrict: string;
  partnerPhone: string;
  cropTopic: string;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}

export const ChatView: React.FC<ChatViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { openCallModal, currentUser } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c-1',
      partnerName: 'Shree Ganesh Agro Processing',
      partnerRole: 'Buyer / Mill',
      partnerDistrict: 'Latur',
      partnerPhone: '+91 94220 88990',
      cropTopic: 'Soybean (65 quintals)',
      unreadCount: 0,
      lastMessage: 'We can arrange prompt truck pickup tomorrow morning.',
      lastTime: '11:45 AM',
      messages: [
        { id: 'm1', senderId: 'user-buyer-1', senderName: 'Shree Ganesh Agro Processing', text: 'Namaste Rameshji! We saw your 65q Grade A Soybean listing.', timestamp: '11:30 AM' },
        { id: 'm2', senderId: 'user-farmer-1', senderName: 'Ramesh Patil', text: 'Namaste! Yes, the moisture is certified 10.1% with 98.6% purity.', timestamp: '11:35 AM' },
        { id: 'm3', senderId: 'user-buyer-1', senderName: 'Shree Ganesh Agro Processing', text: 'We submitted a bid of ₹4,900/q. We can arrange prompt truck pickup tomorrow morning.', timestamp: '11:45 AM' },
      ],
    },
    {
      id: 'c-2',
      partnerName: 'Balaji Rural Freight',
      partnerRole: 'Transporter',
      partnerDistrict: 'Osmanabad',
      partnerPhone: '+91 98224 55667',
      cropTopic: 'Truck Booking to Latur',
      unreadCount: 1,
      lastMessage: 'Rate is confirmed at ₹28/km. Total around ₹2,100.',
      lastTime: '09:20 AM',
      messages: [
        { id: 'm4', senderId: 'trans-1', senderName: 'Balaji Rural Freight', text: 'Rate is confirmed at ₹28/km. Total around ₹2,100.', timestamp: '09:20 AM' },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>('c-1');
  const [inputText, setInputText] = useState<string>('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user-farmer-1',
      senderName: currentUser?.name || 'Ramesh Patil',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: inputText,
            lastTime: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[680px]">
        
        {/* Left: Chat list */}
        <div className="border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-base text-slate-900">{t('nav.chat', 'Direct Negotiations & Messages')}</h2>
            <p className="text-xs text-slate-500">Secure trader discussions</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-colors flex items-start space-x-3 ${
                    isActive ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    {conv.partnerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{conv.partnerName}</h4>
                      <span className="text-[10px] text-slate-400">{conv.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-semibold truncate">{conv.cropTopic}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="md:col-span-2 flex flex-col bg-slate-50/40">
          
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                {activeConv.partnerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">{activeConv.partnerName}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500">{activeConv.partnerRole} • {activeConv.partnerDistrict}</p>
              </div>
            </div>

            <button
              onClick={() =>
                openCallModal({
                  targetName: activeConv.partnerName,
                  targetRole: activeConv.partnerRole,
                  targetPhone: activeConv.partnerPhone,
                  lotCrop: activeConv.cropTopic,
                })
              }
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('lots.directCall', 'Direct Call')}</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeConv.messages.map((m) => {
              const isMe = m.senderId === (currentUser?.id || 'user-farmer-1');
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">{m.senderName} • {m.timestamp}</span>
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your negotiation message or quality clarification..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs text-xs sm:text-sm flex items-center space-x-1 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ChatView;
