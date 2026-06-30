# ScrapSmart — Smart Scrap Frontend

This is the Figma/Make Vite React UI wired to the Render Express backend plus Firebase Auth/Firestore. The original mobile visual style, colors, cards, spacing, and icon language are preserved as closely as possible while replacing mock data with real backend calls.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_UPLOAD_FOLDER=
VITE_GEOAPIFY_API_KEY=
```

Set `VITE_API_BASE_URL` to your Render backend URL, for example `https://scrapsmart-backend.onrender.com`. Do not put Gemini keys in frontend env files. For prototype image upload, the frontend uses a Cloudinary unsigned upload preset.

## Run Frontend

```bash
npm install
npm run dev
```

## Required Backend Services

- Firebase Authentication
- Cloud Firestore
- Cloudinary unsigned prototype uploads
- Geoapify map tiles and routing API for optional live tracking
- Render Express backend
- API routes: `/api/ai/detect`, `/api/requests`, `/api/collector`, `/api/user`

## Firebase Collections Expected

- `users/{uid}`
- `collectors/{uid}`
- `requests/{requestId}`
- `reviews/{reviewId}`
- `aiDetections/{detectionId}`

## AI Scrap Detection

The user uploads scrap images directly to Cloudinary using the configured unsigned upload preset, then clicks "Detect Scrap with AI". Firestore stores only Cloudinary image metadata on the pickup request. Gemini is called only through the Render backend.

## Optional Live Tracking

After a collector accepts a request, they can optionally share live location. The app stores the latest demo location in `collectors/{uid}.currentLocation` through the Render backend.

## Test User Flow

1. Register as user.
2. Upload up to 5 images, each max 5MB.
3. Run AI detection or edit category manually.
4. Create pickup request.
5. View request in My Requests.
6. Cancel while status is `open`.
7. Submit review after request is `completed`.

## Test Collector Flow

1. Register as collector with city and comma-separated service areas.
2. Login as collector.
3. View open requests from the same city.
4. Accept request.
5. Enable or skip live tracking.
6. Complete with final price.
