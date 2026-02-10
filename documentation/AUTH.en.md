# Authentication

The application uses Firebase Auth infrastructure but follows an **OTP (One-Time Password)** based flow instead of standard passwords.

## 🔐 Login Flow

1. **Request Code (`SendLoginCodeRequest`):**
   - User enters email address.
   - Server sends a 6-digit code to the email.
   - Returns `twoFactorEnabled` information in response.

2. **Verify (`VerifyLoginCodeRequest`):**
   - User enters the code from the email.
   - If 2FA is enabled, the code from the Authenticator app (`twoFactorCode`) is also requested.
   - If successful, returns `customToken` and Firebase session is opened.

## 📝 Signup Flow

1. **Request Code (`SendSignupCodeRequest`):**
   - Name, Surname, and Email are sent.
   - Checks if the email address is unique.

2. **Verify (`VerifySignupCodeRequest`):**
   - Account is created with the code sent to the email.
   - User is automatically logged in.

## 👤 User Profile (`UserProfile`)

User data is stored in Firestore and contains the following critical information:

- `role`: User role.
- `folders`: User's note folders.
- `pdfSettings`: PDF output settings.
- `customTemplates`: Personalized note templates.
