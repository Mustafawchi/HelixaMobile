# Project Architecture and Navigation

Helixa AI Mobile is developed using **React Native** and **TypeScript**. **Firebase** (Auth, Firestore, Functions) is used as the backend service.

## 📂 Folder Structure

- `src/types`: All TypeScript interfaces (API request/response, models).
- `src/screens`: Application screens.
- `src/components`: Reusable UI components.
- `src/services`: API calls and Firebase operations.
- `src/navigation`: React Navigation definitions.

## 🧭 Navigation Structure

The application consists of 3 main navigation groups (`src/types/navigation.ts`):

### 1. Auth Stack (`AuthStackParamList`)

Screens active when the user is not logged in.

- `Login`: Email entry.
- `Signup`: Registration form.
- `ForgotPassword`: Password reset.

### 2. Main Tab (`MainTabParamList`)

The main bottom menu of the application.

- `Patients`: Patient list main screen.
- `Profile`: Doctor profile.
- `Settings`: Application settings.

### 3. Patients Stack (`PatientsStackParamList`)

Inner navigation for detailed patient operations.

- `PatientList`: List of all patients.
- `PatientDetails`: Details of a single patient.
- `NoteList`: List of notes belonging to the patient.
- `NewNote`: New voice/text note creation screen.
- `NoteDetail`: Note detail and editing.
- `ReferPatient`: Referral letter creation wizard.
- `SummaryToPatient`: Patient information letter wizard.

## 🎨 Design System

The application uses a centralized color palette (`src/types/colors.ts`).

- **Primary Color:** Emerald Green (`#1a4d3e`)
- **Background:** Light Gray (`#f8f9fa`)
- **Text:** Dark Gray (`#111827`)
