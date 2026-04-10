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
        {
            id: 1,
            name: "ალექსანდრე",
            // ეს ლინკი ახლავე გადავამოწმე, ნამდვილად მუშაობს
            img: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=400&auto=format&fit=crop",
            role: { GEO: "CREATIVE DIRECTOR", EN: "CREATIVE DIRECTOR", RU: "КРЕАТИВНЫЙ ДИРЕКТОР" }
        },
        {
            id: 2,
            name: "ნატალი",
            // პროფესიონალი სტილისტი ქალი
            img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=400&auto=format&fit=crop",
            role: { GEO: "COLOR MASTER", EN: "COLOR MASTER", RU: "МАСТЕР КОЛОРИСТ" }
        },
        {
            id: 3,
            name: "მარიამი",
            // ფრჩხილების სპეციალისტი
            img: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=400&auto=format&fit=crop",
            role: { GEO: "NAIL ARTIST", EN: "NAIL ARTIST", RU: "МАСТЕР МАНИКЮРА" }
        }
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