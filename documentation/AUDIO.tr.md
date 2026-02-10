# Ses İşleme ve Streaming (Audio)

Helixa AI'ın çekirdek özelliği, doktor konuşmalarını kaydedip metne ve yapılandırılmış notlara dönüştürmesidir.

## 🔄 Streaming Akışı

Ses işleme süreci `StreamingPhase` tipi ile yönetilen 5 aşamadan oluşur:

1. **Idle:** Bekleme modu.
2. **Converting:** Ses dosyası sunucuya yükleniyor ve formatlanıyor.
3. **Transcribing:** Ses metne (Speech-to-Text) dönüştürülüyor.
4. **Generating:** AI, metni analiz edip not formatına getiriyor.
5. **Complete:** İşlem tamamlandı.

## 🎙 Kayıt Durumu (`AudioRecordingState`)

Kayıt sırasında UI, aşağıdaki verilerle güncellenir:

- `isRecording`: Kayıt aktif mi?
- `isPaused`: Duraklatıldı mı?
- `durationMs`: Geçen süre (milisaniye).
- `metering`: Ses seviyesi (dalga formu görselleştirmesi için).

## 📤 Upload İsteği (`AudioUploadRequest`)

Ses dosyası sunucuya gönderilirken şu bilgiler eklenir:

```typescript
{
  fileUri: string; // Cihazdaki dosya yolu
  templateId: string; // Kullanılan şablon ID'si
  patientId: string; // İlgili hasta ID'si
  consultationType: string; // Muayene türü
  recordTarget: "consultation" | "procedure"; // Kayıt hedefi
}
```

## ⚠️ Hata Yönetimi

Streaming sırasında bir hata oluşursa `StreamingState` içindeki `error` alanı dolar ve faz `error` durumuna geçer. UI bu durumda kullanıcıya "Yeniden Dene" seçeneği sunmalıdır.
