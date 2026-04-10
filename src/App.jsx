import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TRANSLATIONS, SALON_DATA, getNextDays } from './constants'
import { LangBar, AddonSection, SocialProof, AdminAuthModal, StatusModal } from './Components'
import AdminDashboard from './AdminDashboard'
import { supabase } from './supabaseClient'

const TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];

export default function App() {
  const [lang, setLang] = useState('GEO');
  const [step, setStep] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getNextDays('ENG')[0].value);
  const [booking, setBooking] = useState({ time: null, name: '', phone: '' });

  const [alert, setAlert] = useState({ open: false, msg: '', type: 'error' });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('rigshi_admin') === 'true');
  const [allBookings, setAllBookings] = useState([]);

  const t = TRANSLATIONS[lang];

  // მონაცემების წამოღება ბაზიდან
  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('*');
      if (!error && data) setAllBookings(data);
    };
    fetchBookings();
  }, []);

  const toggleService = (s) => {
    setSelectedServices(prev =>
      prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
    );
  };

  const toggleAddon = (a) => {
    setSelectedAddons(prev =>
      prev.find(x => x.id === a.id) ? prev.filter(x => x.id !== a.id) : [...prev, a]
    );
  };

  const handleAuth = (password) => {
    if (password === "1234") {
      localStorage.setItem('rigshi_admin', 'true');
      setIsAdmin(true); setIsAuthOpen(false); setStep(6);
    } else {
      setAlert({ open: true, msg: "პაროლი არასწორია", type: 'error' });
    }
  };

  const handleFinalBook = async () => {
    if (!booking.name || booking.phone.length < 9) {
      setAlert({ open: true, msg: "გთხოვთ შეავსოთ სახელი და სწორი ნომერი", type: 'error' });
      return;
    }

    const newBookingData = {
      staff_name: selectedStaff.name['GEO'],
      date: selectedDate,
      time: booking.time,
      user_name: booking.name,
      user_phone: booking.phone,
      total_price: totalPrice,
      services: selectedServices.map(s => s.name[lang]).join(', ')
    };

    const { data, error } = await supabase.from('bookings').insert([newBookingData]).select();

    if (error) {
      setAlert({ open: true, msg: "ბაზის შეცდომა: " + error.message, type: 'error' });
    } else {
      setAllBookings([...allBookings, data[0]]);
      setStep(5);
    }
  };

  const resetAll = () => {
    setStep(1); setSelectedStaff(null); setSelectedServices([]); setSelectedAddons([]);
    setBooking({ time: null, name: '', phone: '' });
  };

  const addToCalendar = () => {
    const staffName = selectedStaff?.name || "სტილისტი";
    const eventText = encodeURIComponent(`ვიზიტი - ${staffName} (Rigshi Luxury)`);
    const eventDate = "20260412";
    const startTime = booking.time.replace(':', '');
    const endTime = (parseInt(startTime) + 100).toString();
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventText}&dates=${eventDate}T${startTime}00Z/${eventDate}T${endTime}00Z&details=Rigshi+Luxury+Booking`;
    window.open(googleUrl, '_blank');
  };

  const totalPrice = selectedServices.reduce((a, b) => a + b.price, 0) + selectedAddons.reduce((a, b) => a + b.price, 0);

  // ანიმაციის პარამეტრები
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex items-center justify-center p-2 md:p-6 antialiased selection:bg-amber-500 overflow-hidden font-sans">
      <StatusModal isOpen={alert.open} message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, open: false })} />
      <AdminAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuth={handleAuth} />

      <div className={`w-full ${step === 6 ? 'max-w-full' : 'max-w-[500px] md:max-w-[1100px]'} bg-black/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative h-[92vh] max-h-[850px]`}>

        {step !== 6 && (
          <div className="absolute top-8 left-10 right-10 flex justify-between items-center z-50">
            <LangBar lang={lang} setLang={setLang} />
            <SocialProof lang={lang} />
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden pt-24">
          <AnimatePresence mode="wait">

            {step === 1 && (
              <motion.div key="step1" {...pageVariants} transition={{ duration: 0.3 }} className="flex-1 overflow-y-auto no-scrollbar py-6 md:py-0">
                <div className="p-6 md:p-8 flex flex-col md:justify-center min-h-full max-w-[900px] mx-auto w-full px-6 md:px-12">
                  <button onClick={() => isAdmin ? setStep(6) : setIsAuthOpen(true)} className="text-3xl md:text-5xl font-black italic tracking-tighter mb-8 md:mb-12 text-center uppercase hover:text-amber-500 transition-colors shrink-0">Rigshi <span className="text-zinc-800">/ Luxury</span></button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-10 md:pb-0">
                    {SALON_DATA.staff.map(s => (
                      <motion.button
                        key={s.id}
                        onClick={() => { setSelectedStaff(s); setStep(2) }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center gap-4 p-6 md:p-8 bg-zinc-900/30 rounded-[2.5rem] border border-white/5 hover:border-amber-500/50 transition-all group shrink-0"
                      >
                        <img src={s.img} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10 shadow-xl" />
                        <div className="text-center">
                          <p className="font-bold text-lg md:text-xl text-white">{s.name[lang]}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{s.role[lang]}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...pageVariants} transition={{ duration: 0.3 }} className="flex-1 flex flex-col overflow-hidden px-6 md:px-12">
                <div className="py-3 flex justify-between items-end border-b border-white/5 bg-zinc-950/20 shrink-0">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-xs md:text-sm font-black text-zinc-400 mb-8 uppercase hover:text-amber-500 transition-all bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                    {t.staffTitle}
                  </button><p className="text-amber-500 font-black italic text-3xl tracking-tighter">{totalPrice} ₾</p></div>
                <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SALON_DATA.services.map(s => {
                      const isSel = selectedServices.some(x => x.id === s.id);
                      return (
                        <button key={s.id} onClick={() => toggleService(s)} className={`p-4 rounded-[1.5rem] border transition-all flex items-center justify-between text-left min-h-[75px] ${isSel ? 'bg-amber-500 border-amber-500 text-black scale-[1.02]' : 'bg-zinc-900/30 border-white/5 hover:border-amber-500/40'}`}><div className="flex-1 pr-3"><p className={`font-bold text-sm leading-tight ${isSel ? 'text-black' : 'text-zinc-100'}`}>{s.name[lang]}</p><p className={`text-[9px] ${isSel ? 'text-black/60' : 'text-zinc-500'}`}>{s.desc}</p></div><span className={`font-black text-base ${isSel ? 'text-black' : 'text-amber-500'}`}>{s.price} ₾</span></button>
                      )
                    })}
                  </div>
                  <AddonSection addons={SALON_DATA.addons} selected={selectedAddons} toggle={toggleAddon} lang={lang} t={t} />
                </div>
                <div className="p-6 shrink-0 bg-zinc-950/40 border-t border-white/5 flex justify-center"><button disabled={selectedServices.length === 0 && selectedAddons.length === 0} onClick={() => setStep(3)} className={`w-full max-w-[500px] py-5 rounded-3xl font-black text-lg uppercase italic transition-all ${(selectedServices.length > 0 || selectedAddons.length > 0) ? 'bg-amber-500 text-black shadow-2xl' : 'bg-zinc-800 text-zinc-600'}`}>შემდეგი</button></div>
              </motion.div>
            )}

            {step === 3 && selectedStaff && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 flex-1 flex flex-col justify-center max-w-[900px] mx-auto w-full">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-xs md:text-sm font-black text-zinc-400 mb-8 uppercase hover:text-amber-500 transition-all bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                  {t.serviceTitle}
                </button>

                <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar shrink-0 px-2">
                  {getNextDays(lang).map(dateObj => (
                    <motion.button
                      key={dateObj.value}
                      onClick={() => setSelectedDate(dateObj.value)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 px-8 py-5 rounded-[2rem] border transition-all flex flex-col items-center min-w-[110px] ${selectedDate === dateObj.value
                        ? 'bg-amber-500 border-amber-500 text-black shadow-lg scale-105'
                        : 'bg-zinc-900/40 border-white/5 text-zinc-400'
                        }`}
                    >
                      <span className="text-xs font-black uppercase italic">{dateObj.display}</span>
                      <span className={`text-[10px] font-black uppercase mt-1 tracking-[0.2em] ${selectedDate === dateObj.value ? 'text-black/80' : 'text-amber-500'}`}>
                        {dateObj.weekDay}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'].map(t_val => {
                    if (t_val === "10:00") console.log("DB-დან:", allBookings[0]?.date, "საიტზე:", selectedDate);
                    const isBooked = allBookings.some(b =>
                      b.staff_name?.trim() === selectedStaff.name['GEO'].trim() &&
                      b.date?.trim() === selectedDate.trim() &&
                      b.time?.trim() === t_val.trim()
                    );
                    return (
                      <button
                        key={t_val}
                        disabled={isBooked}
                        onClick={() => { setBooking({ ...booking, time: t_val }); setStep(4) }}
                        className={`py-5 rounded-2xl border font-black text-sm transition-all ${isBooked ? 'bg-zinc-950 text-zinc-800 opacity-30 cursor-not-allowed' : 'border-white/5 bg-zinc-900/30 hover:border-amber-500 hover:shadow-lg'}`}
                      >
                        {isBooked ? t.booked : t_val}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" {...pageVariants} transition={{ duration: 0.3 }} className="p-8 flex-1 flex flex-col justify-center max-w-[420px] mx-auto w-full">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 text-xs md:text-sm font-black text-zinc-400 mb-8 uppercase hover:text-amber-500 transition-all bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                  {t.timeTitle}
                </button>
                <div className="bg-zinc-900/40 p-6 rounded-[2rem] border border-white/10 text-center mb-6"><p className="text-amber-500 font-black italic text-4xl leading-none">{booking.time}</p><p className="text-zinc-400 text-[10px] font-black uppercase mt-2 tracking-widest">{selectedDate}</p></div>
                <div className="space-y-3">
                  <input type="text" placeholder="თქვენი სახელი" className="w-full p-4 bg-zinc-900/60 border border-white/5 rounded-2xl text-zinc-100 font-bold outline-none focus:border-amber-500/50" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
                  <input type="text" placeholder="ტელეფონი" className="w-full p-4 bg-zinc-900/60 border border-white/5 rounded-2xl text-zinc-100 font-bold outline-none focus:border-amber-500/50 tracking-widest" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value.replace(/\D/g, '') })} />
                  <button onClick={handleFinalBook} className="w-full bg-amber-500 text-black py-5 rounded-[2.5rem] font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] mt-4 uppercase italic">დაჯავშნა</button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 text-center flex-1 flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-amber-500 text-black rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(245,158,11,0.4)] mb-8 font-black animate-bounce">✓</div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight mb-4 text-white">წარმატებით დაჯავშნე!</h2>
                <div className="flex flex-col gap-3 items-center">
                  <button onClick={addToCalendar} className="px-8 py-4 bg-white/5 border border-amber-500/30 text-amber-500 rounded-2xl text-[10px] font-black uppercase hover:bg-amber-500 hover:text-black transition-all shadow-xl">📅 კალენდარში დამატება</button>
                  <button onClick={resetAll} className="mt-4 text-[11px] font-black text-amber-500/40 hover:text-amber-500 border-b border-white/5 uppercase pb-1 transition-all tracking-widest">მთავარზე დაბრუნება</button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden">
                <AdminDashboard allBookings={allBookings} setAllBookings={setAllBookings} staffData={SALON_DATA.staff} lang={lang} onClose={() => setStep(1)} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <footer className="p-4 border-t border-white/5 bg-black/20 text-center shrink-0">
          <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em]">RIGSHI LUXURY 2026</p>
        </footer>
      </div>
    </div>
  );
}