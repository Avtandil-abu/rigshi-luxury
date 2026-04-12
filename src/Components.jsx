import React, { useState } from 'react';

// თანამედროვე შეტყობინების ფანჯარა (Alert-ის ნაცვლად)
export const StatusModal = ({ isOpen, message, onClose, type = 'error' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-[320px] bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center font-black ${type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {type === 'error' ? '!' : '✓'}
                </div>
                <p className="text-white font-bold text-sm mb-6 leading-relaxed">{message}</p>
                <button onClick={onClose} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase transition-all">კარგი</button>
            </div>
        </div>
    );
};

export const AdminAuthModal = ({ isOpen, onClose, onAuth }) => {
    const [pass, setPass] = useState('');
    const [show, setShow] = useState(false);
    const [remember, setRemember] = useState(false);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-[350px] bg-zinc-900 border border-amber-500/30 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">Admin Access</h3>
                <div className="relative mb-4">
                    <input
                        autoFocus
                        type={show ? 'text' : 'password'}
                        placeholder="პაროლი"
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center outline-none focus:border-amber-500 transition-all pr-12"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAuth(pass, remember)}
                    />
                    <button
                        onClick={() => setShow(!show)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-500 transition-all"
                    >
                        {show ? '🙈' : '👁️'}
                    </button>
                </div>
                <label className="flex items-center justify-center gap-2 text-zinc-500 text-[11px] font-black uppercase mb-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="accent-amber-500"
                    />
                    დამახსოვრება
                </label>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-500">გაუქმება</button>
                    <button onClick={() => onAuth(pass, remember)} className="flex-1 py-3 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg">შესვლა</button>
                </div>
            </div>
        </div>
    );
};



export const LangBar = ({ lang, setLang }) => (
    <div className="flex bg-zinc-900/80 rounded-full p-1 border border-white/10 backdrop-blur-md shadow-2xl">
        {['GE', 'EN', 'RU'].map((l) => {
            const code = l === 'GE' ? 'GEO' : l === 'EN' ? 'ENG' : 'RUS';
            return (
                <button key={l} onClick={() => setLang(code)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${lang === code ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500'}`}>
                    {l}
                </button>
            )
        })}
    </div>
);

export const AddonSection = ({ addons, selected, toggle, lang, t }) => (
    <div className="pt-4 border-t border-white/5 mt-4 shrink-0">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500/40 mb-3 text-center">{t.addonTitle}</h3>
        <div className="grid grid-cols-3 gap-2">
            {addons.map(a => {
                const isSel = selected.find(x => x.id === a.id);
                return (
                    <button key={a.id} onClick={() => toggle(a)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-500 border ${isSel ? 'bg-amber-500 border-amber-500 shadow-lg' : 'bg-zinc-900/30 border-white/5 hover:border-amber-500/30'}`}>
                        <span className="text-lg">{a.icon}</span>
                        <span className={`text-[11px] font-black uppercase text-center leading-none ${isSel ? 'text-black' : 'text-zinc-500'}`}>{a.name[lang]}</span>
                    </button>
                )
            })}
        </div>
    </div>
);