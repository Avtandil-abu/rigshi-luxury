import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const TIMES = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

export default function AdminDashboard({ allBookings, setAllBookings, staffData, lang, onClose }) {
    const [viewedMaster, setViewedMaster] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [newDate, setNewDate] = useState('');

    const playAlert = () => {
        const audio = new Audio('/alert.mp3');
        audio.play().catch(e => console.log("ხმის დაკვრა დაიბლოკა, დააწკაპუნეთ ეკრანზე!"));
    };

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (editingBooking) setEditingBooking(null);
                else if (confirmDelete) setConfirmDelete(null);
                else onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, editingBooking, confirmDelete]);

    useEffect(() => {
        // ვქმნით არხს, რომელიც უსმენს INSERT-ს (ახალ ჩანაწერს)
        const channel = supabase
            .channel('admin-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bookings' },
                (payload) => {
                    console.log('ახალი ჯავშანი მოვიდა!', payload.new);

                    // 1. ვამატებთ ახალ ჯავშანს სიის სათავეში, რომ ეგრევე გამოჩნდეს
                    setAllBookings(prev => [payload.new, ...prev]);

                    // 2. ვრთავთ ხმას (გლოვოს პონტში)
                    playAlert();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [setAllBookings]);

    // --- WhatsApp შეტყობინებების ლოგიკა (3 ენაზე) ---
    const notifyViaWhatsApp = (phone, name, time, date, cancelled = false) => {
        const cleanPhone = phone.replace(/\s+/g, '');
        // ხმის დაკვრის ფუნქცია

        // ვიყენებთ ზუსტად იმ კოდებს (GEO, ENG, RUS), რაც შენს ბაზაშია
        const messages = {
            GEO: {
                cancel: `გამარჯობა ${name}, თქვენი ჯავშანი (${date}, ${time}) სალონში "Rigshi Luxury" გაუქმებულია.`,
                update: `გამარჯობა ${name}, თქვენს ჯავშანში შევიდა ცვლილება. ახალი დრო: ${date}, ${time}.`
            },
            ENG: {
                cancel: `Hello ${name}, your booking at "Rigshi Luxury" on ${date} at ${time} has been cancelled.`,
                update: `Hello ${name}, your booking has been updated. New time: ${date} at ${time}.`
            },
            RUS: {
                cancel: `Здравствуйте ${name}, ваша запись в "Rigshi Luxury" (${date}, ${time}) отменена.`,
                update: `Здравствуйте ${name}, в вашу запись внесены изменения. Новое время: ${date}, ${time}.`
            }
        };

        // ვიღებთ მესიჯს არჩეული ენის მიხედვით, თუ რამე აირია - ვიყენებთ ქართულს (GEO)
        const currentMsgMap = messages[lang] || messages.GEO;
        const msg = cancelled ? currentMsgMap.cancel : currentMsgMap.update;

        window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    };

    const deleteBooking = async (id) => {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (!error) {
            setAllBookings(allBookings.filter(b => b.id !== id));
            setConfirmDelete(null);
        } else {
            alert('შეცდომა: ' + error.message);
        }
    };

    const openEdit = (b) => {
        setEditingBooking(b);
        setNewTime(b.time);
        setNewDate(b.date);
    };

    const saveEdit = async () => {
        const { error } = await supabase
            .from('bookings')
            .update({ time: newTime, date: newDate })
            .eq('id', editingBooking.id);

        if (!error) {
            setAllBookings(allBookings.map(b =>
                b.id === editingBooking.id ? { ...b, time: newTime, date: newDate } : b
            ));
            // შეტყობინების გაგზავნა განახლებაზე
            notifyViaWhatsApp(editingBooking.user_phone, editingBooking.user_name, newTime, newDate, false);
            setEditingBooking(null);
        } else {
            alert('შეცდომა: ' + error.message);
        }
    };
    // --- ნატიური კალენდრის ფუნქცია ---

    const totalRevenue = allBookings.reduce((s, b) => s + (b.total_price || 0), 0);

    const getMasterStats = (staffNameObj) => {
        const masterBookings = allBookings.filter(b => b.staff_name === staffNameObj['GEO']);
        const revenue = masterBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        return { bookings: masterBookings, revenue, count: masterBookings.length };
    };

    const ConfirmDeleteModal = () => (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-[350px] bg-zinc-900 border border-red-500/30 p-8 rounded-[2.5rem] shadow-2xl text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-500/20 text-red-500 font-black text-xl">!</div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">ჯავშნის გაუქმება</h3>
                <p className="text-sm text-zinc-400 mb-6">ნამდვილად გსურთ ამ ჯავშნის გაუქმება?</p>
                <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 text-xs font-black uppercase text-zinc-500 hover:text-white transition-all">არა</button>
                    <button onClick={() => {
                        const booking = allBookings.find(b => b.id === confirmDelete);
                        if (booking) {
                            notifyViaWhatsApp(booking.user_phone, booking.user_name, booking.time, booking.date, true);
                        }
                        deleteBooking(confirmDelete);
                    }} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase shadow-lg">დიახ</button>
                </div>
            </div>
        </div>
    );

    if (viewedMaster) {
        const stats = getMasterStats(viewedMaster.name);
        return (
            <div className="h-full flex flex-col bg-[#08080a] animate-in slide-in-from-right-8 duration-500 overflow-hidden">
                {confirmDelete && <ConfirmDeleteModal />}

                {editingBooking && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-[380px] bg-zinc-900 border border-amber-500/30 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">ჯავშნის რედაქტირება</h3>
                            <p className="text-sm text-zinc-400 mb-6 font-bold">{editingBooking.user_name} — {editingBooking.services}</p>
                            <div className="space-y-3 mb-6">
                                <div>
                                    <p className="text-xs text-zinc-500 font-black uppercase mb-2">თარიღი</p>
                                    <input type="text" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-black uppercase mb-2">დრო</p>
                                    <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full p-3 bg-zinc-800 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-amber-500">
                                        {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingBooking(null)} className="flex-1 py-3 text-xs font-black uppercase text-zinc-500 hover:text-white transition-all">გაუქმება</button>
                                <button onClick={saveEdit} className="flex-1 py-3 bg-amber-500 text-black rounded-xl text-xs font-black uppercase shadow-lg">შენახვა + WhatsApp</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewedMaster(null)} className="p-2 hover:bg-white/10 rounded-full text-amber-500 bg-white/5 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <h2 className="text-lg font-black uppercase text-white tracking-tighter">{viewedMaster.name[lang]}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 text-center">
                            <p className="text-xs text-zinc-400 font-black uppercase mb-1 tracking-widest">შემოსავალი</p>
                            <p className="text-2xl font-black text-amber-500">{stats.revenue} ₾</p>
                        </div>
                        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 text-center">
                            <p className="text-xs text-zinc-400 font-black uppercase mb-1 tracking-widest">ვიზიტები</p>
                            <p className="text-2xl font-black text-white">{stats.count}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] pl-2">ჯავშნების ისტორია</h3>
                        {stats.bookings.slice().reverse().map(b => (
                            <div key={b.id} className="bg-zinc-900/30 border border-white/5 p-5 rounded-3xl group">
                                <div className="flex justify-between items-start">
                                    <div className="text-left">
                                        <p className="text-base font-black text-white group-hover:text-amber-500 transition-colors">{b.user_name}</p>
                                        <p className="text-sm font-bold text-zinc-400 mt-1">{b.user_phone}</p>
                                        <p className="text-xs text-amber-500/80 mt-2 font-black uppercase tracking-widest">{b.date} / {b.time} — {b.end_time}</p>
                                        {b.services && <p className="text-xs text-zinc-300 mt-2 font-bold">{b.services}</p>}
                                        <p className="text-sm font-black text-amber-500 mt-2">{b.total_price} ₾</p>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0 ml-3">
                                        <button onClick={() => openEdit(b)} className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-black transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button onClick={() => setConfirmDelete(b.id)} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
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
            {confirmDelete && <ConfirmDeleteModal />}
            <div className="px-8 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-black uppercase text-amber-500 italic tracking-tighter leading-none">ბიზნესის მართვა</h2>
                    <p className="text-sm text-zinc-400 font-black uppercase mt-1 tracking-widest leading-none">საერთო ბრუნვა: {totalRevenue} ₾</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24">
                <section className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'შემოსავალი', value: `${totalRevenue} ₾`, color: 'text-amber-500' },
                        { label: 'ვიზიტები', value: allBookings.length, color: 'text-white' },
                        { label: 'საშუალო', value: `${allBookings.length ? Math.round(totalRevenue / allBookings.length) : 0} ₾`, color: 'text-zinc-300' }
                    ].map((m, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[1.5rem] text-center">
                            <p className="text-xs text-zinc-400 uppercase font-black mb-1 tracking-widest">{m.label}</p>
                            <p className={`text-xl font-black ${m.color} tracking-tighter`}>{m.value}</p>
                        </div>
                    ))}
                </section>

                <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.5em] mb-4 text-center">მასტერების რეიტინგი</h3>
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
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-2 leading-tight">{s.role[lang]}</p>
                                    </div>
                                    <div className="w-full border-t border-white/5 pt-4">
                                        <p className="text-xl font-black text-white">{stats.revenue} ₾</p>
                                        <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mt-1">{Math.round(percent)}% წილი</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none flex justify-center">
                <div className="flex gap-2">
                    <button onClick={() => { localStorage.removeItem('rigshi_admin'); window.location.reload(); }} className="pointer-events-auto flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-red-500/30 text-red-400 hover:border-red-500 transition-all rounded-full shadow-2xl">
                        <span className="text-xs font-black uppercase tracking-[0.3em]">გასვლა</span>
                    </button>
                    <button onClick={onClose} className="pointer-events-auto flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white hover:border-amber-500 transition-all rounded-full shadow-2xl">
                        <span className="text-xs font-black uppercase tracking-[0.3em]">საიტზე დაბრუნება</span>
                    </button>
                </div>
            </div>
        </div>
    );
}