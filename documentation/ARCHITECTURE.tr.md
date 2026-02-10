# Proje Mimarisi ve Navigasyon

Helixa AI Mobile, **React Native** ve **TypeScript** kullanılarak geliştirilmiştir. Backend servisi olarak **Firebase** (Auth, Firestore, Functions) kullanılır.

## 📂 Klasör Yapısı

- `src/types`: Tüm TypeScript arayüzleri (API request/response, modeller).
- `src/screens`: Uygulama ekranları.
- `src/components`: Yeniden kullanılabilir UI bileşenleri.
- `src/services`: API çağrıları ve Firebase işlemleri.
- `src/navigation`: React Navigation tanımları.

## 🧭 Navigasyon Yapısı

Uygulama 3 ana navigasyon grubundan oluşur (`src/types/navigation.ts`):

### 1. Auth Stack (`AuthStackParamList`)

Kullanıcı giriş yapmadığında aktif olan ekranlar.

- `Login`: E-posta girişi.
- `Signup`: Kayıt formu.
- `ForgotPassword`: Şifre sıfırlama.

### 2. Main Tab (`MainTabParamList`)

Uygulamanın ana alt menüsü.

- `Patients`: Hasta listesi ana ekranı.
- `Profile`: Doktor profili.
- `Settings`: Uygulama ayarları.

### 3. Patients Stack (`PatientsStackParamList`)

Hasta ile ilgili detaylı işlemlerin yapıldığı iç navigasyon.

- `PatientList`: Tüm hastaların listesi.
- `PatientDetails`: Tek bir hastanın detayları.
- `NoteList`: Hastaya ait notların listesi.
- `NewNote`: Yeni sesli/yazılı not oluşturma ekranı.
- `NoteDetail`: Not detay ve düzenleme.
- `ReferPatient`: Sevk mektubu oluşturma sihirbazı.
- `SummaryToPatient`: Hastaya bilgilendirme mektubu sihirbazı.

## 🎨 Tasarım Sistemi

Uygulama merkezi bir renk paleti kullanır (`src/types/colors.ts`).

- **Primary Color:** Emerald Green (`#1a4d3e`)
- **Background:** Light Gray (`#f8f9fa`)
- **Text:** Dark Gray (`#111827`)
