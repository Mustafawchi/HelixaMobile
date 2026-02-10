# Kimlik Doğrulama (Authentication)

Uygulama, Firebase Auth altyapısını kullanır ancak standart şifre yerine **OTP (One-Time Password)** tabanlı bir akış izler.

## 🔐 Giriş Akışı (Login)

1. **Kod İsteme (`SendLoginCodeRequest`):**
   - Kullanıcı e-posta adresini girer.
   - Sunucu, e-postaya 6 haneli bir kod gönderir.
   - Yanıt olarak `twoFactorEnabled` bilgisi döner.

2. **Doğrulama (`VerifyLoginCodeRequest`):**
   - Kullanıcı e-postadaki kodu girer.
   - Eğer 2FA açıksa, Authenticator uygulamasındaki kod da (`twoFactorCode`) istenir.
   - Başarılı olursa `customToken` döner ve Firebase oturumu açılır.

## 📝 Kayıt Akışı (Signup)

1. **Kod İsteme (`SendSignupCodeRequest`):**
   - Ad, Soyad ve E-posta gönderilir.
   - E-posta adresinin benzersiz olduğu kontrol edilir.

2. **Doğrulama (`VerifySignupCodeRequest`):**
   - E-postaya gelen kod ile hesap oluşturulur.
   - Kullanıcı otomatik olarak giriş yapar.

## 👤 Kullanıcı Profili (`UserProfile`)

Kullanıcı verileri Firestore'da saklanır ve şu kritik bilgileri içerir:

- `role`: Kullanıcı rolü.
- `folders`: Kullanıcının not klasörleri.
- `pdfSettings`: PDF çıktı ayarları.
- `customTemplates`: Kişiselleştirilmiş not şablonları.
