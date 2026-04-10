import { useState, useEffect } from 'react'; // დაემატა useEffect
import { supabase } from './supabaseClient';

export default function AdminDashboard({ allBookings, setAllBookings, staffData, lang, onClose }) {
    const [viewedMaster, setViewedMaster] = useState(null);

    // --- დაემატა Escape ღილაკით გამოსვლა ---
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const deleteBooking = async (id) => {
        if (window.confirm('ნამდვილად გსურთ ამ ჯავშნის გაუქმება?')) {
            const { error } = await supabase.from('bookings').delete().eq('id', id);
            if (!error) {
                setAllBookings(allBookings.filter(b => b.id !== id));
            } else {
                alert('შეცდომა: ' + error.message);
            }
        }
    };

    const notifyViaWhatsApp = (phone, name, time, date) => {
        const msg = `გამარჯობა ${name}, სალონიდან გწერთ. თქვენი ჯავშანი (${date}, ${time}) გაუქმდა.`;
        const encodedMsg = encodeURIComponent(msg);
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
    };

    const totalRevenue = allBookings.reduce((s, b) => s + (b.total_price || 0), 0);

    const getMasterStats = (staffNameObj) => {
        const masterBookings = allBookings.filter(b => b.staff_name === staffNameObj['GEO']);
        const revenue = masterBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        return { bookings: masterBookings, revenue, count: masterBookings.length };
    };

    // მასტერის პერსონალური გვერდი
    if (viewedMaster) {
        const stats = getMasterStats(viewedMaster.name);
        return (
            <div className="h-full flex flex-col bg-[#08080a] animate-in slide-in-from-right-8 duration-500 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewedMaster(null)} className="p-2 hover:bg-white/10 rounded-full text-amber-500 bg-white/5 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <h2 className="text-lg font-black uppercase text-white tracking-tighter">{viewedMaster.name[lang]}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 text-center">
                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">შემოსავალი</p>
                            <p className="text-2xl font-black text-amber-500">{stats.revenue} ₾</p>
                        </div>
                        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 text-center">
                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">ვიზიტები</p>
                            <p className="text-2xl font-black text-white">{stats.count}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-2">ჯავშნების ისტორია</h3>
                        {stats.bookings.slice().reverse().map(b => (
                            <div key={b.id} className="bg-zinc-900/30 border border-white/5 p-5 rounded-3xl flex justify-between items-center group">
                                <div className="text-left">
                                    <p className="text-base font-black text-white group-hover:text-amber-500 transition-colors">{b.user_name}</p>
                                    <p className="text-xs font-bold text-zinc-500 mt-1">{b.user_phone}</p>
                                    <p className="text-[10px] text-amber-500/70 mt-3 font-black uppercase tracking-widest">{b.date} / {b.time}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => notifyViaWhatsApp(b.user_phone, b.user_name, b.time, b.date)} className="p-4 bg-green-500/10 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
                                    </button>
                                    <button onClick={() => deleteBooking(b.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#08080a] animate-in fade-in duration-500 overflow-hidden relative">
            <div className="px-8 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-black uppercase text-amber-500 italic tracking-tighter leading-none">ბიზნესის მართვა</h2>
                    <p className="text-xs text-zinc-600 font-black uppercase mt-1 tracking-widest leading-none">საერთო ბრუნვა: {totalRevenue} ₾</p>
                </div>
                <button onClick={onClose} className="p-3 bg-amber-500 text-black rounded-xl hover:bg-white transition-all active:scale-95 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24">
                <section className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'შემოსავალი', value: `${totalRevenue} ₾`, color: 'text-amber-500' },
                        { label: 'ვიზიტები', value: allBookings.length, color: 'text-white' },
                        { label: 'საშუალო', value: `${allBookings.length ? Math.round(totalRevenue / allBookings.length) : 0} ₾`, color: 'text-zinc-500' }
                    ].map((m, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[1.5rem] text-center">
                            <p className="text-[10px] text-zinc-600 uppercase font-black mb-1 tracking-widest">{m.label}</p>
                            <p className={`text-xl font-black ${m.color} tracking-tighter`}>{m.value}</p>
                        </div>
                    ))}
                </section>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-4 text-center">მასტერების რეიტინგი</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {staffData.map(s => {
                            const stats = getMasterStats(s.name);
                            const percent = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0;
                            return (
                                <button key={s.id} onClick={() => setViewedMaster(s)}
                                    className="bg-zinc-900/20 border border-white/5 hover:border-amber-500/40 p-5 rounded-[2rem] transition-all group relative text-center flex flex-col items-center"
                                >
                                    <img src={s.img} className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border-2 border-white/5 shadow-2xl mb-4" />
                                    <div className="mb-4">
                                        <h4 className="text-base font-black text-white group-hover:text-amber-500 transition-colors leading-none">{s.name[lang]}</h4>
                                        <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-2 leading-tight">{s.role[lang]}</p>
                                    </div>
                                    <div className="w-full border-t border-white/5 pt-4">
                                        <p className="text-xl font-black text-white">{stats.revenue} ₾</p>
                                        <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mt-1">{Math.round(percent)}% წილი</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* დაემატა "საიტზე დაბრუნება" ღილაკი ქვემოთ */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none flex justify-center">
                <button
                    onClick={onClose}
                    className="pointer-events-auto flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-amber-500 transition-all rounded-full shadow-2xl group"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">საიტზე დაბრუნება</span>
                    <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}