# VIP Tikuv — tikuv mashinalari do'koni boshqaruv platformasi

Telefon do'koni uchun qurilgan "1C" platformasi (`vipmobile-sales` / `vip-mobile-warehouse`) asosida, tikuv mashinalari do'koni uchun qaytadan qurilgan. Bitta Firebase loyihada ikki turdagi zahirani birga boshqaradi:

- **Mashinalar** (`machines`) — har biri alohida: brend/model/seriya, sotib olish va sotish narxi, xaridor/sotuvchi, foyda hisobi. Telefon platformasidagi to'liq savdo daftari mantiqi shu yerda saqlanib qoldi (band/qaytarish/sotildi oqimlari, Moliya bo'limi, parol bilan himoyalangan foyda ko'rinishi).
- **Ehtiyot qismlar** (`parts`) — igna, shpulka, kamar, motor va shu kabi kichik qismlar uchun **miqdor asosida** zahira (telefon platformasida bu yo'q edi — bu ombor-ilovasidan olingan g'oya, lekin endi sotuv/foyda bilan to'liq bog'langan: `partSales` jurnali orqali).

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `index.html` | Asosiy boshqaruv paneli (xodimlar uchun, login talab qiladi) |
| `catalog.html` | Ommaviy, login talab qilmaydigan mijozlar katalogi — faqat ko'rish, narx va mavjudlik |
| `firestore.rules` | Firestore xavfsizlik qoidalari (xodimlar ro'yxati shu yerda) |
| `firebase.json`, `.firebaserc.example` | Firebase Hosting/CLI konfiguratsiyasi |
| `SheetSync.gs` | Ixtiyoriy: Google Sheets bilan ikki tomonlama sinxronlash skripti |

## Ishga tushirish

1. [Firebase Console](https://console.firebase.google.com/)'da yangi loyiha yarating.
2. **Build → Firestore Database**'ni yoqing (production mode, qulay region tanlang).
3. **Build → Authentication → Sign-in method → Email/Password**'ni yoqing. **Users** bo'limida o'zingiz uchun email+parol yarating (bir nechta xodim bo'lishi mumkin).
4. Loyiha sozlamalaridan (⚙️ → Project settings → your apps → Web app qo'shing) `firebaseConfig` obyektini oling.
5. `index.html` va `catalog.html` ikkisining ham boshidagi `FIREBASE_CONFIG` o'zgaruvchisiga shu qiymatlarni joylashtiring (ikkisida bir xil bo'lishi kerak — bir xil loyiha).
6. `index.html`'dagi `ALLOWED_EMAILS` ro'yxatiga barcha xodimlarning emailini qo'shing.
7. `firestore.rules` faylidagi `isStaff()` ichidagi email ro'yxatini ham xuddi shunday to'ldiring, so'ng shu qoidalarni Firebase Console → Firestore Database → Rules bo'limiga joylashtiring (yoki Firebase CLI: `firebase deploy --only firestore:rules`).
8. `.firebaserc.example`'ni `.firebaserc`ga nusxalab, `REPLACE_WITH_PROJECT_ID`ni haqiqiy loyiha ID'siga almashtiring (agar Hosting orqali joylashtirmoqchi bo'lsangiz).
9. Fayllarni biror joyda oching (lokal: ikki marta bosib brauzerda ochish kifoya, yoki `firebase deploy --only hosting` orqali onlayn joylashtiring). Email/parol bilan kiring.

Google Sheets sinxronlash va ommaviy katalog ikkisi ham **ixtiyoriy** — ularsiz ham platforma to'liq ishlaydi.

### Ommaviy katalog (ixtiyoriy)
`catalog.html`'dagi `tel:+998000000000` raqamini o'zingizning haqiqiy raqamingizga almashtiring. Ushbu sahifani mijozlarga xavfsiz tarqatish mumkin — login talab qilmaydi, faqat "Mijozlar katalogida ko'rsatilsin" belgisi qo'yilgan va omborda mavjud bo'lgan mahsulotlarning narxi va nomi ko'rinadi (tannarx, ta'minotchi, seriya raqami hech qachon ko'rinmaydi).

### Google Sheets sinxronlash (ixtiyoriy)
`SheetSync.gs`'ni Google Sheets → Extensions → Apps Script orqali joylang, Web App sifatida deploy qiling, exec URL'ni ilova ichidagi **Sozlamalar** bo'limiga kiriting.

## Hozircha kiritilmagan narsalar

Telefon platformasidagi quyidagi funksiyalar bu versiyaga hali qo'shilmagan — kerak bo'lsa ayting, qo'shib beraman:

- Excel orqali ommaviy import (ustunlarni avtomatik moslashtirish bilan)
- Oylik arxiv tizimi (har oy uchun alohida Sheet/skript)
- To'liq tozalash / zaxira eksport oqimi

Hozirgi versiyada **Excel'ga eksport** (Moliya bo'limida) ishlaydi, lekin import yo'q.

## Texnik eslatma

Original telefon platformasi kabi — build qadamsiz, vanilla HTML/CSS/JS, Firebase (compat SDK) orqali. Hech qanday server kerak emas; to'g'ridan-to'g'ri fayl sifatida ochish yoki Firebase Hosting'ga joylashtirish mumkin.
