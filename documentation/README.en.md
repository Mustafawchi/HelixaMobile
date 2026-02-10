# Helixa AI - Mobile Application

Helixa AI is an AI-powered assistant developed for healthcare professionals for voice note-taking, patient management, and automatic letter (Referral/Patient Letter) generation.

## 📱 Key Features

- **Voice Assistant:** Real-time voice recording, transcription, and AI-based summarization.
- **Patient Management:** Patient list, medical history, and note tracking.
- **PDF Reporting:** Professional letter generation with customizable templates (Header/Footer/Signature).
- **Security:** OTP-based login and 2FA support.

## 🚀 Quick Start

### Requirements

- Node.js (v18+)
- React Native CLI
- CocoaPods (for iOS)
- Android Studio / Xcode

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-repo/helixa-mobile.git
   cd helixa-mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. iOS Dependencies (Mac Only):

   ```bash
   cd ios && pod install && cd ..
   ```

4. Start the Application:
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   ```

## 📚 Technical Documentation

Detailed technical documentation is modularized:

- **[Architecture and Navigation](./docs/ARCHITECTURE.en.md):** Project structure and screen flows.
- **[Audio Processing](./docs/AUDIO.en.md):** Streaming logic and recording processes.
- **[Authentication](./docs/AUTH.en.md):** Login, Signup, and Token management.
- **[PDF and Reporting](./docs/PDF.en.md):** PDF generation services and settings.
