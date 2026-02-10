# PDF ve Raporlama

Helixa AI, oluşturulan notlardan otomatik olarak resmi mektuplar (PDF) üretebilir. Bu işlem sunucu tarafında (Server-Side Rendering) gerçekleşir.

## 📄 Mektup Türleri

### 1. Hasta Mektubu (Patient Letter)

Hastaya muayene özetini içeren bilgilendirme mektubudur.

- **Girdi:** `GeneratePatientLetterRequest` (Not içeriği, Doktor adı, Pratik adı).
- **Çıktı:** Özet metin ve PDF.

### 2. Sevk Mektubu (Referral Letter)

Hastayı başka bir uzmana sevk etmek için oluşturulan resmi mektuptur.

- **Girdi:** `GenerateReferralLetterRequest`
  - `patientDetails`: Hasta adı, doğum tarihi, adres.
  - `medicalHistory`: Tıbbi geçmiş özeti.
  - `referralDoctor`: Sevk edilen doktor bilgileri.
  - `senderDetails`: Gönderen doktor bilgileri.

## ⚙️ PDF Ayarları (`PdfSettings`)

Her kullanıcı, PDF çıktılarının nasıl görüneceğini `UserProfile` altındaki `pdfSettings` objesi ile özelleştirebilir:

### Header (Üst Bilgi)

- `headerLogoUrl`: Kurum logosu.
- `headerLogoPosition`: Logo konumu (sol, orta, sağ).
- `headerBackgroundColor`: Arka plan rengi.

### Footer (Alt Bilgi)

- `footerLogoUrl`: Alt logo.
- `includePageNumbers`: Sayfa numaraları gösterilsin mi?

### İmza

- `signatureUrl`: Doktorun dijital imzası.
- `includeSignature`: İmza mektuba eklensin mi?

## 🖨 PDF Oluşturma Süreci

1. Client, ilgili `Generate...Request` verisini hazırlar.
2. Kullanıcının `pdfSettings` ayarları ile birleştirilir.
3. Sunucuya (Cloud Function) gönderilir.
4. Sunucu, HTML şablonunu Puppeteer ile PDF'e çevirir (`application/pdf`).
5. Mobil uygulama gelen Blob verisini indirir ve paylaşım menüsünü açar.
