import { useState } from 'react';
import { supabase } from './supabaseClient'; // არ დაგავიწყდეს იმპორტი

export default function AdminDashboard({ allBookings, setAllBookings, staffData, lang, onClose }) {
    const [viewedMaster, setViewedMaster] = useState(null);

    // --- 1. წაშლის ფუნქცია (ბაზიდან და ეკრანიდან) ---
    const deleteBooking = async (id) => {
        if (window.confirm('ნამდვილად გსურთ ამ ჯავშნის გაუქმება?')) {
            const { error } = await supabase.from('bookings').delete().eq('id', id);
            if (!error) {
                setAllBookings(allBookings.filter(b => b.id !== id));
            } else {
                alert('შეცდომა ბაზასთან: ' + error.message);
            }
        }
    };

    // --- 2. WhatsApp-ზე გაფრთხილების ფუნქცია ---
    const notifyViaWhatsApp = (phone, name, time, date) => {
        const msg = `გამარჯობა ${name}, სალონიდან გწერთ. სამწუხაროდ, გაუთვალისწინებელი მიზეზის გამო თქვენი ჯავშანი (${date}, ${time}) გაუქმდა. ბოდიშს გიხდით.`;
        const encodedMsg = encodeURIComponent(msg);
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
    };

    const totalRevenue = allBookings.reduce((s, b) => s + (b.total_price || 0), 0);

    const getMasterStats = (name) => {
        const masterBookings = allBookings.filter(b => b.staff_name === name);
        const revenue = masterBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        return { bookings: masterBookings, revenue, count: masterBookings.length };
    };

    // --- მასტერის პერსონალური გვერდი ---
    if (viewedMaster) {
        const stats = getMasterStats(viewedMaster.name);
        return (
            <div className="h-full flex flex-col bg-[#08080a] animate-in slide-in-from-right-8 duration-500 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewedMaster(null)} className="p-2 hover:bg-white/5 rounded-full text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div className="flex items-center gap-3">
                            <img src={viewedMaster.img} className="w-10 h-10 rounded-full object-cover border border-amber-500" />
                            <h2 className="text-base font-black uppercase text-white tracking-tighter">{viewedMaster.name}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar space-y-6">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
                            <p className="text-[8px] text-zinc-500 font-black uppercase mb-1 tracking-widest">შემოსავალი</p>
                            <p className="text-2xl font-black text-amber-500 tracking-tighter">{stats.revenue} ₾</p>
                        </div>
                        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
                            <p className="text-[8px] text-zinc-500 font-black uppercase mb-1 tracking-widest">ვიზიტები</p>
                            <p className="text-2xl font-black text-white tracking-tighter">{stats.count}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-2">ჯავშნების ისტორია</h3>
                        {stats.bookings.slice().reverse().map(b => (
                            <div key={b.id} className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex justify-between items-center group">
                                <div className="text-left">
                                    <p className="text-sm font-black text-white group-hover:text-amber-500 transition-colors">{b.user_name}</p>
                                    <p className="text-[10px] font-bold text-zinc-500">{b.user_phone}</p>
                                    <p className="text-[8px] text-zinc-600 mt-2 font-black uppercase">{b.date} / {b.time}</p>
                                </div>

                                {/* აქ დავამატე ორი ღილაკი: WhatsApp და წაშლა */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => notifyViaWhatsApp(b.user_phone, b.user_name, b.time, b.date)}
                                        className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                                        title="გაფრთხილება WhatsApp-ით"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
                                    </button>

                                    <button
                                        onClick={() => deleteBooking(b.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        title="ჯავშნის წაშლა"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- მთავარი ადმინ პანელი ---
    return (
        <div className="h-full flex flex-col bg-[#08080a] animate-in fade-in duration-500 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-lg font-black uppercase text-amber-500 italic tracking-tighter leading-none">ბიზნესის მართვა</h2>
                    <p className="text-[8px] text-zinc-600 font-black uppercase mt-1 tracking-widest leading-none">საერთო ბრუნვა: {totalRevenue} ₾</p>
                </div>
                <button onClick={onClose} className="p-2 bg-amber-500 text-black rounded-lg hover:bg-white transition-all shadow-lg active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
                <section className="grid grid-cols-3 gap-3 mb-10">
                    {[
                        { label: 'ჯამური შემოსავალი', value: `${totalRevenue} ₾`, color: 'text-amber-500' },
                        { label: 'ჯამური ვიზიტები', value: allBookings.length, color: 'text-white' },
                        { label: 'საშუალო ჩეკი', value: `${allBookings.length ? Math.round(totalRevenue / allBookings.length) : 0} ₾`, color: 'text-zinc-500' }
                    ].map((m, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl text-center">
                            <p className="text-[7px] text-zinc-600 uppercase font-black mb-1">{m.label}</p>
                            <p className={`text-base md:text-xl font-black ${m.color} tracking-tighter`}>{m.value}</p>
                        </div>
                    ))}
                </section>

                <div className="space-y-3">
                    <h3 className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 text-center">აირჩიეთ მასტერი დეტალებისთვის</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {staffData.map(s => {
                            const stats = getMasterStats(s.name);
                            const percent = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0;
                            return (
                                <button key={s.id} onClick={() => setViewedMaster(s)}
                                    className="bg-zinc-900/20 border border-white/5 hover:border-amber-500/40 p-5 rounded-[2rem] transition-all group relative text-left"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={s.img} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-white/5 shadow-xl" />
                                        <div>
                                            <h4 className="text-base font-black text-white group-hover:text-amber-500 transition-colors leading-none">{s.name}</h4>
                                            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{s.role[lang]}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 border-t border-white/5 pt-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[8px] text-zinc-600 font-black uppercase">გამომუშავება:</p>
                                            <p className="text-lg font-black text-white">{stats.revenue} ₾</p>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500" style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <p className="text-[7px] text-zinc-700 font-black uppercase text-right">{Math.round(percent)}% წილი ბრუნვაში</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-950/50 flex justify-center shrink-0">
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em]">Business Control v1.0</p>
            </div>
        </div>
    );
}