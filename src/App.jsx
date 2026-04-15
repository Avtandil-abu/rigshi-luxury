import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TRANSLATIONS, SALON_DATA, getNextDays } from './constants'
import { LangBar, AddonSection, AdminAuthModal, StatusModal } from './Components'
import AdminDashboard from './AdminDashboard'
import { supabase } from './supabaseClient'
import emailjs from '@emailjs/browser'
import { useSpring, animated } from '@react-spring/web'
import confetti from 'canvas-confetti'
import { Analytics } from "@vercel/analytics/react"


const TIMES = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

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

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('*');
      if (!error && data) setAllBookings(data);
    };
    fetchBookings();
  }, []);

  const totalDuration = [...selectedServices, ...selectedAddons].reduce((sum, s) => sum + (s.duration || 60), 0);

  const toggleService = (s) => {
    setSelectedServices(prev =>
      prev.find(x => x.id === s.id)
        ? prev.filter(x => x.id !== s.id)
        : [...prev, s]
    );
  };

  const toggleAddon = (a) => {
    setSelectedAddons(prev =>
      prev.find(x => x.id === a.id) ? prev.filter(x => x.id !== a.id) : [...prev, a]
    );
  };

  const handleAuth = (password, remember) => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      if (remember) localStorage.setItem('rigshi_admin', 'true');
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

    const [hours, minutes] = booking.time.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours, minutes + totalDuration);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    const newBookingData = {
      staff_name: selectedStaff.name['GEO'],
      date: selectedDate,
      time: booking.time,
      end_time: endTime,
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
      emailjs.send(
        'service_mcdkwtf',
        'template_16v8rjr',
        {
          name: booking.name,
          time: booking.time,
          message: `სტილისტი: ${selectedStaff.name['GEO']} | თარიღი: ${selectedDate} | საათი: ${booking.time} | სერვისები: ${selectedServices.map(s => s.name[lang]).join(', ')} | ჯამი: ${totalPrice}₾ | ტელ: ${booking.phone}`,
          title: 'ახალი ჯავშანი'
        },
        '6tbdk47-jjPYN3cGa'
      );
      const confirmMsg = `გამარჯობა ${booking.name}! თქვენი ჯავშანი დადასტურდა ✓\n\nსტილისტი: ${selectedStaff.name['GEO']}\nთარიღი: ${selectedDate}\nდრო: ${booking.time}\nსერვისები: ${selectedServices.map(s => s.name[lang]).join(', ')}\nჯამი: ${totalPrice}₾\n\nგმადლობთ! Rigshi Luxury 🖤`;
      const encodedConfirm = encodeURIComponent(confirmMsg);
      // window.open(`https://wa.me/${booking.phone}?text=${encodedConfirm}`, '_blank');
      setStep(5);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ffffff', '#fbbf24']
      });
    }
  };

  const resetAll = () => {
    setStep(1); setSelectedStaff(null); setSelectedServices([]); setSelectedAddons([]);
    setBooking({ time: null, name: '', phone: '' });
  };

  const addToCalendar = (e) => {

    try {
      const monthMap = {
        'იან': '01', 'თებ': '02', 'მარ': '03', 'აპრ': '04', 'მაი': '05', 'ივნ': '06',
        'ივლ': '07', 'აგვ': '08', 'სექ': '09', 'ოქტ': '10', 'ნოე': '11', 'დეკ': '12',
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
        'Янв': '01', 'Фев': '02', 'Мар': '03', 'Апр': '04', 'Май': '05', 'Июн': '06',
        'Июл': '07', 'Авг': '08', 'Сен': '09', 'Окт': '10', 'Ноя': '11', 'Дек': '12'
      };

      const dateStr = selectedDate.trim();
      const parts = dateStr.split(' ');
      let day = parts[0].match(/\d+/) ? parts[0].padStart(2, '0') : parts[1].padStart(2, '0');
      let monthName = parts[0].match(/\d+/) ? parts[1] : parts[0];

      const month = monthMap[monthName] || '04';
      const year = "2026";
      const formattedDate = `${year}${month}${day}`;

      const time = booking?.time || "10:00";
      const startTime = time.replace(':', '') + "00";
      let endHour = (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0');
      const endTime = `${endHour}${time.split(':')[1]}00`;

      const content = {
        GE: { title: 'Luxury ვიზიტი', staff: 'სტილისტი' },
        EN: { title: 'Luxury Visit', staff: 'Stylist' },
        RU: { title: 'Luxury Визит', staff: 'Стилист' }
      };
      const cur = content[lang] || content.EN;
      const serviceNames = selectedServices?.map(s => s.name[lang]).join(', ') || "";
      const staffName = selectedStaff?.name[lang] || "";

      // --- აი აქედან იცვლება ყველაფერი აიფონისთვის ---

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Rigshi Luxury//NONSGML v1.0//EN",
        "BEGIN:VEVENT",
        `SUMMARY:${cur.title}: ${serviceNames}`,
        `DTSTART:${formattedDate}T${startTime}`,
        `DTEND:${formattedDate}T${endTime}`,
        `DESCRIPTION:${cur.staff}: ${staffName}\\nServices: ${serviceNames}`,
        "LOCATION:Tbilisi, Georgia",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\n");

      // ვქმნით ფაილს (Blob)
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);

      // ვაიძულებთ ბრაუზერს გადმოწეროს/გახსნას ფაილი
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "rigshi-booking.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Native Calendar file triggered!");

    } catch (error) {
      console.error("Calendar Error:", error);
    }
  };

  const totalPrice = selectedServices.reduce((a, b) => a + b.price, 0) + selectedAddons.reduce((a, b) => a + b.price, 0);
  const priceSpring = useSpring({
    value: totalPrice,
    config: { tension: 170, friction: 26 }
  })
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="h-screen text-white flex items-center justify-center p-2 md:p-6 antialiased selection:bg-amber-500 overflow-hidden font-sans relative" style={{
      background: 'radial-gradient(ellipse at 20% 50%, #1a0a00 0%, #050505 50%, #0a0014 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite'
    }}>

      <StatusModal isOpen={alert.open} message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, open: false })} />
      <AdminAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuth={handleAuth} />

      <div className={`w-full ${step === 6 ? 'max-w-full' : 'max-w-[500px] md:max-w-[1100px]'} bg-black/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative h-[92vh] max-h-[850px]`}>

        {/* --- Background Effects Layer (Glow, Particles, Noise) --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 1. Noise Texture */}
          <div className="noise-bg opacity-20" />

          {/* 2. Luxury Glow Effects */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

          {/* 3. Golden Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                animationDuration: `${8 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 8}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                position: 'absolute',
              }}
            />
          ))}
        </div>

        {/* --- UI Elements Layer --- */}
        {step !== 6 && (
          <div className="absolute top-8 left-10 right-10 flex justify-between items-center z-50">
            <LangBar lang={lang} setLang={setLang} />
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden pt-16 relative z-10">
          <AnimatePresence mode="wait">
            {/* აქედან უკვე იწყება შენი Step 1... */}

            {step === 1 && (
              <motion.div key="step1" {...pageVariants} transition={{ duration: 0.3 }} className="flex-1 overflow-y-auto no-scrollbar py-6 md:py-0">
                <div className="p-6 md:p-8 flex flex-col md:justify-center min-h-full max-w-[900px] mx-auto w-full px-6 md:px-12">
                  <button onClick={() => isAdmin ? setStep(6) : setIsAuthOpen(true)} className="text-3xl md:text-5xl font-black italic tracking-tighter mb-8 md:mb-12 text-center uppercase hover:text-amber-500 transition-colors shrink-0">Rigshi <span className="text-zinc-800">/ Luxury</span></button>
                  <h2 className="text-center text-sm md:text-base uppercase tracking-[0.2em] font-medium text-amber-500/90 mb-10">
                    აირჩიეთ მასტერი
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-10 md:pb-0">
                    {SALON_DATA.staff.map(s => (
                      <motion.button
                        key={s.id}
                        onClick={() => { setSelectedStaff(s); setStep(2) }}
                        whileHover={{ y: -8, scale: 1.03, rotateY: 8 }}
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
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs md:text-sm font-black text-zinc-400 mb-8 uppercase hover:text-amber-500 transition-all bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                    {t.staffTitle}
                  </button>
                  <animated.p className="text-amber-500 font-black italic text-3xl tracking-tighter">
                    {priceSpring.value.to(v => `${Math.round(v)} ₾`)}
                  </animated.p>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SALON_DATA.services.map(s => {
                      const isSel = selectedServices.some(x => x.id === s.id);
                      return (
                        <motion.button
                          key={s.id}
                          onClick={() => toggleService(s)}
                          whileTap={{ scale: 0.95 }}
                          className={`p-4 rounded-[1.5rem] border transition-all flex items-center justify-between text-left min-h-[75px] ${isSel ? 'bg-amber-500 border-amber-500 text-black scale-[1.02]' : 'bg-zinc-900/30 border-white/5 hover:border-amber-500/40'}`}
                        >
                          <div className="flex-1 pr-3">
                            <p className={`font-bold text-sm leading-tight ${isSel ? 'text-black' : 'text-zinc-100'}`}>{s.name[lang]}</p>
                            <p className={`text-[11px] ${isSel ? 'text-black/70' : 'text-zinc-400'}`}>{s.desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSel && (
                              <motion.span
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="text-black font-black text-lg"
                              >✓</motion.span>
                            )}
                            <span className={`font-black text-base ${isSel ? 'text-black' : 'text-amber-500'}`}>{s.price} ₾</span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                  <AddonSection addons={SALON_DATA.addons} selected={selectedAddons} toggle={toggleAddon} lang={lang} t={t} />
                </div>

                {totalDuration > 180 && (
                  <div className="mx-6 mb-3 px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                    <p className="text-amber-500 text-[11px] font-black uppercase tracking-wide">
                      ⚠️ {t.longVisitWarning}
                    </p>
                  </div>
                )}

                <div className="p-6 shrink-0 bg-zinc-950/40 border-t border-white/5 flex justify-center">
                  <button
                    disabled={selectedServices.length === 0 && selectedAddons.length === 0}
                    onClick={() => setStep(3)}
                    className={`w-full max-w-[500px] py-5 rounded-3xl font-black text-lg uppercase italic transition-all ${(selectedServices.length > 0 || selectedAddons.length > 0) ? 'bg-amber-500 text-black shadow-2xl' : 'bg-zinc-800 text-zinc-600'}`}
                  >
                    {t.nextBtn}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && selectedStaff && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 flex-1 flex flex-col overflow-hidden max-w-[900px] mx-auto w-full">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-xs md:text-sm font-black text-zinc-400 mb-3 uppercase hover:text-amber-500 transition-all bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                  {t.serviceTitle}
                </button>

                <div className="grid grid-cols-4 gap-2 pb-2 shrink-0">
                  {getNextDays(lang).map(dateObj => (
                    <motion.button
                      key={dateObj.value}
                      onClick={() => setSelectedDate(dateObj.value)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 px-3 py-3 rounded-[2rem] border transition-all flex flex-col items-center min-w-[110px] ${selectedDate === dateObj.value
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
                <div className="border-t border-white/20 my-3 shrink-0" />
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 overflow-y-auto no-scrollbar flex-1">
                  {TIMES.map(t_val => {
                    const [selH, selM] = t_val.split(':').map(Number);
                    const selStart = selH * 60 + selM;
                    const selEnd = selStart + totalDuration;

                    const isBooked = allBookings.some(b => {
                      if (b.staff_name?.trim() !== selectedStaff.name['GEO'].trim()) return false;
                      if (b.date?.trim() !== selectedDate.trim()) return false;
                      if (!b.end_time) return b.time?.trim() === t_val.trim();
                      const [bH, bM] = b.time.split(':').map(Number);
                      const [eH, eM] = b.end_time.split(':').map(Number);
                      const bStart = bH * 60 + bM;
                      const bEnd = eH * 60 + eM;
                      return selStart < bEnd && selEnd > bStart;
                    });

                    return (
                      <motion.button
                        key={t_val}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: TIMES.indexOf(t_val) * 0.02,
                          ease: "easeOut"
                        }}
                        disabled={isBooked}
                        onClick={() => { setBooking({ ...booking, time: t_val }); setStep(4) }}
                        className={`py-5 rounded-2xl border font-black text-sm transition-all ${isBooked
                          ? 'bg-red-950/10 border-red-950/20 text-red-900/60 cursor-not-allowed'
                          : 'border-white/5 bg-zinc-900/30 hover:border-amber-500 hover:shadow-lg'
                          }`}
                      >
                        {isBooked ? t.booked : t_val}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" {...pageVariants} transition={{ duration: 0.3 }} className="p-8 flex-1 flex flex-col justify-center max-w-[420px] mx-auto w-full">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 text-xs md:text-sm font-black text-zinc-400 mb-8 uppercase hover:text-amber-500 transition-all bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                  {t.timeTitle}
                </button>
                <div className="bg-zinc-900/40 p-6 rounded-[2rem] border border-white/10 text-center mb-6">
                  <p className="text-amber-500 font-black italic text-4xl leading-none">{booking.time}</p>
                  <p className="text-zinc-400 text-[10px] font-black uppercase mt-2 tracking-widest">{selectedDate}</p>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder={t.namePlaceholder} className="w-full p-4 bg-zinc-900/60 border border-white/5 rounded-2xl text-zinc-100 font-bold outline-none focus:border-amber-500/50" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
                  <input type="text" placeholder={t.phonePlaceholder} className="w-full p-4 bg-zinc-900/60 border border-white/5 rounded-2xl text-zinc-100 font-bold outline-none focus:border-amber-500/50 tracking-widest" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value.replace(/\D/g, '') })} />
                  <button onClick={handleFinalBook} className="w-full bg-amber-500 text-black py-5 rounded-[2.5rem] font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] mt-4 uppercase italic">{t.bookBtn}</button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 text-center flex-1 flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-amber-500 text-black rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(245,158,11,0.4)] mb-8 font-black animate-bounce">✓</div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight mb-4 text-white">წარმატებით დაჯავშნე!</h2>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    // 1. აიფონზე თითის დაჭერისას პირდაპირ ვიძახებთ ფუნქციას
                    onTouchStart={(e) => {
                      console.log("Touch started!");
                      addToCalendar(); // (e) აღარ გადასცე
                    }}
                    // 2. onClick-ს ვუბლოკავთ თავის საქმეს, რომ მეორედ აღარ გაეშვას
                    onClick={(e) => e.preventDefault()}
                    style={{
                      zIndex: 999999,
                      position: 'relative',
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    className="px-8 py-4 bg-white/5 border border-amber-500/30 text-amber-500 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-xl"
                  >
                    📅 კალენდარში დამატება
                  </button>
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
      <Analytics />
    </div>
  );
}