import { useState } from 'react';
import { motion } from 'motion/react';
import { X, MoreVertical } from "@/src/lib/icons";
import { ViewType } from '../App';

interface DonateViewProps {
  setView: (view: ViewType) => void;
}

export function DonateView({ setView }: DonateViewProps) {
  const [amount, setAmount] = useState('1');
  const [currency, setCurrency] = useState('USD');
  const [subscription, setSubscription] = useState('Once');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 bg-white z-50 flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sticky top-0 bg-white z-20 text-black">
        <button 
          onClick={() => setView('home')} 
          className="p-3 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        >
          <X className="w-[28px] h-[28px]" strokeWidth={2} />
        </button>
        <div className="flex flex-col items-center justify-center">
          <h1 className="font-extrabold text-[#5BCCBB] text-[15px] leading-tight tracking-[0.2px]">PRAYER TIMES</h1>
          <h2 className="font-arabic font-extrabold text-[#5BCCBB] text-[18px] leading-[1.1] mt-[-2px]">مواقيت الصلاة</h2>
        </div>
        <button className="p-3 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
          <MoreVertical className="w-7 h-7" strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 pb-8 flex flex-col max-w-full">
        {/* Banner Text */}
        <div className="relative mb-[40px] text-center mt-6">
          <div className="absolute inset-0 bg-[#eef8f7] opacity-60 transform -skew-y-[4deg] -z-10 rounded-[40px] scale-110 blur-xl"></div>
          
          <h2 className="text-[38px] font-bold leading-[1.05] tracking-tight relative z-10 text-left px-2">
            <span className="text-[#5acbbb]">"Share your bit and</span>
            <br />
            <span className="text-[#50c2b2] text-[48px] font-black tracking-tighter">SERVE ISLAM..</span>
          </h2>
        </div>

        {/* Amount Input Component */}
        <div className="flex justify-center mb-6 pl-2 pr-2">
          <div className="flex items-center w-full max-w-[360px]">
            {/* Left Box (DONATE) */}
            <div className="bg-[#e4f4f2] text-[#5acbbb] font-extrabold text-[18px] tracking-wide py-5 px-6 rounded-l-full relative z-0 pl-7 w-[130px] flex items-center pr-10 -mr-10 h-[72px]">
              DONATE
            </div>

            {/* Center Circle (Amount) */}
            <div className="bg-[#5acbbb] rounded-full w-[100px] h-[100px] flex items-center justify-center shadow-sm relative z-10 shrink-0">
              <input 
                type="text" 
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="bg-transparent text-white font-extrabold text-[32px] w-full text-center focus:outline-none placeholder-white/70"
                placeholder="0"
              />
            </div>

            {/* Right Box (Currency) */}
            <div className="bg-[#eff1f4] py-5 px-5 rounded-r-full relative z-0 flex items-center pl-10 -ml-10 h-[72px] flex-1">
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-black font-extrabold text-[18px] focus:outline-none appearance-none cursor-pointer pr-4 w-full"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <div className="pointer-events-none text-gray-700 absolute right-[22px]">
                <svg className="fill-current w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex justify-between gap-[6px] mb-3">
          {['1', '10', '50', '100', 'Other'].map((val) => (
            <button
              key={val}
              onClick={() => val !== 'Other' && setAmount(val)}
              className="flex-1 py-2.5 rounded-[10px] border-[1.5px] border-[#5acbbb] font-extrabold text-[16px] text-black bg-white active:scale-95 transition-transform"
            >
              {val}
            </button>
          ))}
        </div>

        <p className="text-center text-gray-900 font-bold text-[15px] mb-5">
          (For Sadqa e Nafila Only)
        </p>

        <hr className="border-black mb-5 border-[0.5px]" />

        {/* Subscription Plan */}
        <h3 className="font-extrabold text-[22px] text-black mb-4 tracking-tight">Subscription Plan</h3>
        
        <div className="flex items-center gap-[18px] mb-5">
          {['Every Friday', 'Monthly', 'Once'].map((plan) => (
            <label key={plan} className="flex items-center gap-2 cursor-pointer text-black">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="subscription" 
                  value={plan}
                  checked={subscription === plan}
                  onChange={() => setSubscription(plan)}
                  className="w-5 h-5 appearance-none border-[2px] border-gray-400 rounded-full checked:border-gray-500 transition-colors" 
                />
                {subscription === plan && (
                  <span className="w-2.5 h-2.5 bg-gray-500 rounded-full absolute pointer-events-none"></span>
                )}
              </div>
              <span className="font-medium text-[16px]">{plan}</span>
            </label>
          ))}
        </div>

        <hr className="border-black mb-6 border-[0.5px]" />

        {/* UPI Button */}
        <a 
          href={`upi://pay?pa=nazir.md1@ibl&pn=Prayer%20Times&am=${amount || 1}&cu=INR`}
          className="w-full bg-[#fff] hover:bg-[#f9f9f9] border-[2px] border-[#5acbbb] rounded-[10px] py-[12px] flex flex-col items-center justify-center transition-colors mb-3 shadow-sm active:scale-95"
        >
          <span className="font-extrabold text-[20px] text-black tracking-tight">Pay with UPI Apps</span>
          <span className="text-[13px] font-bold text-gray-500 mt-0.5">GPay, PhonePe, Paytm & more</span>
        </a>

        {/* Stripe Button */}
        <button className="w-full bg-[#f3f9f9] hover:bg-[#eaf5f5] border border-[#d6ebe9] rounded-[10px] py-[10px] flex items-center justify-center transition-colors mb-6 shadow-sm active:scale-95">
          <span className="text-[#635bff] text-[38px] font-bold tracking-tighter leading-none pb-1" style={{fontFamily: 'Helvetica, Arial, sans-serif'}}>stripe</span>
        </button>

        <p className="text-black font-medium leading-[1.35] mb-8 text-[16px]">
          <span className="font-extrabold">Note:</span> In case of re-installation, subscription status will not show until you subscribe again.
        </p>

        {/* Fitra & Zakat */}
        <h3 className="font-extrabold text-[22px] text-black mb-4 tracking-tight">For Fitra & Zakat</h3>
        
        <div className="flex gap-3 pb-4">
          <button className="flex-1 flex items-center justify-center gap-3 border-[2.5px] border-[#5acbbb] rounded-full py-4 px-2 active:scale-95 transition-transform bg-white">
             <div className="text-[#5acbbb] bg-white rounded-full p-0.5 shrink-0">
               {/* Custom sack with plant icon */}
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-[38px] h-[38px]">
                  <path d="M12 2c-1.3 0-2.4 1-2.9 2H6.5C5.7 4 5 4.7 5 5.5V7c0 .5.3 1 .8 1.3l.9 8.2c.2 1.9 1.9 3.5 3.8 3.5h3c1.9 0 3.6-1.6 3.8-3.5l.9-8.2c.5-.3.8-.8.8-1.3V5.5c0-.8-.7-1.5-1.5-1.5h-2.6c-.5-1-1.6-2-2.9-2zm0 2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-4 4h8v1H8V8zm4 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 1.2c-.4 0-.8.4-.8.8s.4.8.8.8.8-.4.8-.8-.4-.8-.8-.8z" />
                  <path d="M12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 1.2c.4 0 .8.4.8.8s-.4.8-.8.8-.8-.4-.8-.8.4-.8.8-.8M11 5.5c0 .6.4 1 1 1s1-.4 1-1" fill="white" />
                  <path d="M12 15.5c-.8 0-1.5-.7-1.5-1.5h3c0 .8-.7 1.5-1.5 1.5z" fill="white" />
               </svg>
             </div>
             <span className="font-extrabold text-[22px] text-black pr-1 tracking-tight">FITRA</span>
          </button>
          
          <button className="flex-1 flex items-center justify-center gap-3 border-[2.5px] border-[#5acbbb] rounded-full py-4 px-2 active:scale-95 transition-transform bg-white">
             <div className="text-[#5acbbb] bg-white rounded-full shrink-0">
               {/* Custom hand with coin icon */}
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-[42px] h-[42px]">
                 <path d="M19 16v-2c0-1.1-.9-2-2-2h-3v-2h1c1.1 0 2-.9 2-2s-.9-2-2-2h-2V4c0-1.1-.9-2-2-2s-2 .9-2 2v2H8c-1.1 0-2 .9-2 2s.9 2 2 2h1v2H6c-1.1 0-2 .9-2 2v2c0 2.8 2.2 5 5 5h5c2.8 0 5-2.2 5-5zm-8-6v-2h2v2h-2zm-2 4h4v2H9v-2zm-1-8h4v2H8V6zm10 10c0 1.7-1.3 3-3 3h-5c-1.7 0-3-1.3-3-3v-1h11v1z" />
                 <circle cx="12" cy="7" r="2.5" fill="white"/>
                 <circle cx="12" cy="15" r="2.5" fill="white"/>
               </svg>
             </div>
             <span className="font-extrabold text-[22px] text-black tracking-tight">ZAKAT</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
