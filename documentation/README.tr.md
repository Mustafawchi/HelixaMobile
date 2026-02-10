# Helixa AI - Mobile Application

Helixa AI, sağlık profesyonelleri için geliştirilmiş, yapay zeka destekli sesli not alma, hasta yönetimi ve otomatik mektup (Referral/Patient Letter) oluşturma asistanıdır.

## 📱 Temel Özellikler

- **Sesli Asistan:** Gerçek zamanlı ses kaydı, transkripsiyon ve AI tabanlı özetleme.
- **Hasta Yönetimi:** Hasta listesi, tıbbi geçmiş ve not takibi.
- **PDF Raporlama:** Özelleştirilebilir şablonlarla (Header/Footer/İmza) profesyonel mektup oluşturma.
- **Güvenlik:** OTP tabanlı giriş ve 2FA desteği.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js (v18+)
- React Native CLI
- CocoaPods (iOS için)
- Android Studio / Xcode

### Kurulum

1. Repoyu klonlayın:

   ```bash
   git clone https://github.com/your-repo/helixa-mobile.git
   cd helixa-mobile
   ```

2. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

3. iOS Bağımlılıkları (Mac Only):

   ```bash
   cd ios && pod install && cd ..
   ```

4. Uygulamayı Başlatın:
   ```bash
   npm run ios      # iOS Simülatör
   npm run android  # Android Emülatör
   ```

## 📚 Teknik Dokümantasyon

Projenin detaylı teknik dokümantasyonu modüler olarak ayrılmıştır:

- **[Mimari ve Navigasyon](./docs/ARCHITECTURE.tr.md):** Proje yapısı ve ekran akışları.
- **[Ses İşleme (Audio)](./docs/AUDIO.tr.md):** Streaming mantığı ve kayıt süreçleri.
- **[Kimlik Doğrulama (Auth)](./docs/AUTH.tr.md):** Login, Signup ve Token yönetimi.
- **[PDF ve Raporlama](./docs/PDF.tr.md):** PDF oluşturma servisleri ve ayarlar.
