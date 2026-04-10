export const getNextDays = (lang) => {
    const days = [];
    const locales = { GEO: 'ka-GE', ENG: 'en-US', RUS: 'ru-RU' };
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(d.toLocaleDateString(locales[lang] || 'ka-GE', { month: 'short', day: 'numeric' }));
    }
    return days;
};

export const TRANSLATIONS = {
    GEO: {
        subtitle: "ავანგარდ ლაქშერი", staffTitle: "აირჩიე სტილისტი", serviceTitle: "მომსახურება",
        addonTitle: "დაამატე კომფორტისთვის", timeTitle: "თარიღი და დრო", bookBtn: "დაჯავშნა",
        successMsg: "წარმატებით დაჯავშნე!", backBtn: "მთავარზე დაბრუნება", booked: "დაკავებულია"
    },
    ENG: {
        subtitle: "AVANGARD LUXURY", staffTitle: "Select Specialist", serviceTitle: "Services",
        addonTitle: "Add for Comfort", timeTitle: "Date & Time", bookBtn: "Confirm Booking",
        successMsg: "Booking Confirmed!", backBtn: "Back to Home", booked: "Booked"
    },
    RUS: {
        subtitle: "АВАНГАРД ЛАКШЕРИ", staffTitle: "Выберите мастера", serviceTitle: "Услуги",
        addonTitle: "Добавить для комфорта", timeTitle: "Дата и время", bookBtn: "Забронировать",
        successMsg: "Запись подтверждена!", backBtn: "На главную", booked: "Занято"
    }
};

export const SALON_DATA = {
    staff: [
        { id: 1, name: "ალექსანდრე", role: { GEO: "Creative Director", ENG: "Creative Director", RUS: "Креативный директор" }, img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&h=200&auto=format&fit=crop", badge: "Expert" },
        { id: 2, name: "ნატალი", role: { GEO: "Color Master", ENG: "Color Master", RUS: "Колорист" }, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop", badge: "Master" },
        { id: 3, name: "მარიამი", role: { GEO: "Nail Artist", ENG: "Nail Artist", RUS: "Мастер маникურ" }, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop", badge: "Top" }
    ],
    services: [
        { id: 101, name: { GEO: "შეჭრა + Ritual", ENG: "Haircut + Ritual", RUS: "Стрижка + Ритуал" }, price: 65, desc: "Kérastase Premium" },
        { id: 102, name: { GEO: "Balayage / AirTouch", ENG: "Balayage / AirTouch", RUS: "Балаяж / AirTouch" }, price: 250, desc: "Olaplex Treatment" },
        { id: 103, name: { GEO: "კერატინი", ENG: "Keratin", RUS: "Кератин" }, price: 180, desc: "Luxe Restoration" },
        { id: 201, name: { GEO: "შილაკი + დიზაინი", ENG: "Shellac + Design", RUS: "Шиллак + Дизайн" }, price: 55, desc: "Luxio Gel" },
        { id: 202, name: { GEO: "Smart პედიკური", ENG: "Smart Pedicure", RUS: "Смарт педикюр" }, price: 80, desc: "Feet Spa" },
        { id: 301, name: { GEO: "სახის წმენდა", ENG: "Deep Cleansing", RUS: "Чистка лица" }, price: 150, desc: "HydraFacial" },
        { id: 401, name: { GEO: "ვიზაჟი", ENG: "Makeup", RUS: "Визаж" }, price: 110, desc: "Glamour Look" }
    ],
    addons: [
        { id: 1, name: { GEO: "ესპრესო", ENG: "Espresso", RUS: "Кофе" }, price: 0, icon: "☕" },
        { id: 2, name: { GEO: "მასაჟი", ENG: "Massage", RUS: "Массаж" }, price: 15, icon: "💆‍♀️" },
        { id: 3, name: { GEO: "ნიღაბი", ENG: "Mask", RUS: "Маска" }, price: 25, icon: "✨" }
    ]
};