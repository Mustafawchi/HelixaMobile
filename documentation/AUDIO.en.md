# Audio Processing and Streaming

The core feature of Helixa AI is recording doctor conversations and converting them into text and structured notes.

## 🔄 Streaming Flow

The audio processing process consists of 5 phases managed by the `StreamingPhase` type:

1. **Idle:** Waiting mode.
2. **Converting:** Audio file is being uploaded to the server and formatted.
3. **Transcribing:** Audio is being converted to text (Speech-to-Text).
4. **Generating:** AI analyzes the text and formats it into a note.
5. **Complete:** Process completed.

## 🎙 Recording State (`AudioRecordingState`)

During recording, the UI is updated with the following data:

- `isRecording`: Is recording active?
- `isPaused`: Is it paused?
- `durationMs`: Elapsed time (milliseconds).
- `metering`: Audio level (for waveform visualization).

## 📤 Upload Request (`AudioUploadRequest`)

The following information is added when sending the audio file to the server:

```typescript
{
  fileUri: string; // File path on device
  templateId: string; // Used template ID
  patientId: string; // Related patient ID
  consultationType: string; // Consultation type
  recordTarget: "consultation" | "procedure"; // Recording target
}
```

## ⚠️ Error Management

If an error occurs during streaming, the `error` field in `StreamingState` is populated, and the phase switches to `error`. The UI should offer a "Retry" option to the user in this case.
