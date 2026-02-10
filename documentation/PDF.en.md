# PDF and Reporting

Helixa AI can automatically generate formal letters (PDF) from created notes. This process takes place on the server-side (Server-Side Rendering).

## 📄 Letter Types

### 1. Patient Letter

An information letter containing the consultation summary for the patient.

- **Input:** `GeneratePatientLetterRequest` (Note content, Doctor name, Practice name).
- **Output:** Summary text and PDF.

### 2. Referral Letter

A formal letter created to refer the patient to another specialist.

- **Input:** `GenerateReferralLetterRequest`
  - `patientDetails`: Patient name, date of birth, address.
  - `medicalHistory`: Medical history summary.
  - `referralDoctor`: Referred doctor details.
  - `senderDetails`: Sender doctor details.

## ⚙️ PDF Settings (`PdfSettings`)

Each user can customize how PDF outputs look via the `pdfSettings` object under `UserProfile`:

### Header

- `headerLogoUrl`: Institution logo.
- `headerLogoPosition`: Logo position (left, center, right).
- `headerBackgroundColor`: Background color.

### Footer

- `footerLogoUrl`: Bottom logo.
- `includePageNumbers`: Show page numbers?

### Signature

- `signatureUrl`: Doctor's digital signature.
- `includeSignature`: Add signature to the letter?

## 🖨 PDF Generation Process

1. Client prepares the relevant `Generate...Request` data.
2. Merges with the user's `pdfSettings`.
3. Sends to the server (Cloud Function).
4. Server converts HTML template to PDF using Puppeteer (`application/pdf`).
5. Mobile application downloads the incoming Blob data and opens the share menu.
