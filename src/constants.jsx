export const getNextDays = (lang) => {
    const days = [];
    const locales = { GEO: 'ka-GE', ENG: 'en-US', RUS: 'ru-RU' };
    const currentLocale = locales[lang] || 'ka-GE';

    const GEO_MONTHS = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];
    const GEO_DAYS = ["კვი", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        // რასაც იუზერი ხედავს (ქართული ან სხვა)
        let display = (lang === 'GEO')
            ? `${d.getDate()} ${GEO_MONTHS[d.getMonth()]}`
            : d.toLocaleDateString(currentLocale, { month: 'short', day: 'numeric' });

        // რასაც ბაზა ხედავს (ყოველთვის ინგლისური)
        const value = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // კვირის დღე
        const weekDay = (lang === 'GEO')
            ? GEO_DAYS[d.getDay()]
            : d.toLocaleDateString(currentLocale, { weekday: 'short' });

        days.push({ display, value, weekDay });
    }
    return days;
};

export const TRANSLATIONS = {
    GEO: { subtitle: "ავანგარდ ლაქშერი", staffTitle: "აირჩიე სტილისტი", serviceTitle: "მომსახურება", addonTitle: "დაამატე კომფორტისთვის", timeTitle: "თარიღი და დრო", bookBtn: "დაჯავშნა", successMsg: "წარმატებით დაჯავშნე!", backBtn: "მთავარზე დაბრუნება", booked: "დაკავებულია" },
    ENG: { subtitle: "AVANGARD LUXURY", staffTitle: "Select Specialist", serviceTitle: "Services", addonTitle: "Add for Comfort", timeTitle: "Date & Time", bookBtn: "Confirm Booking", successMsg: "Booking Confirmed!", backBtn: "Back to Home", booked: "Booked" },
    RUS: { subtitle: "АВАНГАРД ЛАКШЕРИ", staffTitle: "Выберите мастера", serviceTitle: "Услуги", addonTitle: "Добавить для комфорта", timeTitle: "Дата и время", bookBtn: "Забронировать", successMsg: "Запись подтверждена!", backBtn: "На главную", booked: "Занято" }
};

export const SALON_DATA = {
    staff: [
        { id: 1, name: { GEO: "ალექსანდრე", ENG: "ALEXANDER", RUS: "АЛЕКСАНДР" }, img: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=400&auto=format&fit=crop", role: { GEO: "CREATIVE DIRECTOR", ENG: "CREATIVE DIRECTOR", RUS: "КРЕАТИВНЫЙ ДИРЕКТОР" } },
        { id: 2, name: { GEO: "ნატალი", ENG: "NATALIE", RUS: "НАТАЛИ" }, img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=400&auto=format&fit=crop", role: { GEO: "COLOR MASTER", ENG: "COLOR MASTER", RUS: "МАСТЕР КОЛОРИСТ" } },
        { id: 3, name: { GEO: "მარიამი", ENG: "MARIAM", RUS: "МАРИАМ" }, img: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=400&auto=format&fit=crop", role: { GEO: "NAIL ARTIST", ENG: "NAIL ARTIST", RUS: "МАСТЕР МАНИКЮРА" } }
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