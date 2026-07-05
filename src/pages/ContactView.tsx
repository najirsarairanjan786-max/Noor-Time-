import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Send, CheckCircle2 } from "@/src/lib/icons";
import { ViewType } from '../App';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContactViewProps {
  setView: (view: ViewType) => void;
}

export function ContactView({ setView }: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 bg-[#f5f5f5] z-50 flex flex-col overflow-y-auto"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Header */}
      <div className="bg-[#db3e39] text-white flex items-center p-4 shadow-md sticky top-0 z-20">
        <button 
          onClick={() => setView('home')} 
          className="p-1 hover:bg-white/10 rounded-full transition-colors active:scale-95 mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Contact</h1>
      </div>

      <div className="p-4 space-y-4">
        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            Message sent successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Name Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50 flex items-start gap-4">
          <div className="mt-1">
            <User className="w-8 h-8 text-slate-800 fill-slate-800" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <label className="block text-[15px] font-bold text-slate-900 mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-slate-600 focus:outline-none focus:border-[#db3e39] bg-white placeholder-slate-400"
              placeholder="Nazir"
            />
          </div>
        </div>

        {/* Email Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50 flex items-start gap-4">
          <div className="mt-1">
            <Send className="w-8 h-8 text-slate-800" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <label className="block text-[15px] font-bold text-slate-900 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-slate-600 focus:outline-none focus:border-[#db3e39] bg-white placeholder-slate-400"
              placeholder="nazirofficialapps@gmail.com"
            />
          </div>
        </div>

        {/* Message Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
          <label className="block text-[15px] font-bold text-slate-900 mb-2">Message</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-slate-600 focus:outline-none focus:border-[#db3e39] bg-white h-[180px] resize-none"
            placeholder=""
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-center">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-[85%] bg-[#5085db] hover:bg-[#4375c8] disabled:opacity-50 text-white font-bold py-3 rounded-full transition-colors shadow-sm tracking-wide text-sm"
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
