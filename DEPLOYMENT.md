# Daily Gospel PWA - Setup & Deployment Guide

## Overview
A Next.js PWA for daily gospel readings with fingerprint-based trusted device authentication and admin upload functionality.

## Key Features
1. **PWA Installation**: Installs directly to admin-upload page for trusted devices
2. **Fingerprint Authentication**: Auto-bypass password for mother's phone via FingerprintJS
3. **Admin Upload**: Text and image upload with preview functionality
4. **Date Navigation**: Browse gospel readings by date
5. **Mobile Optimized**: Touch-friendly interface with camera integration

## Environment Variables

### Required for Production (Set in Vercel Dashboard)
```bash
MONGODB_URI=mongodb+srv://[user]:[password]@[cluster]/[database]
TRUSTED_FPS=comma,separated,fingerprint,ids
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### Local Development (.env.local)
```bash
MONGODB_URI=mongodb+srv://[user]:[password]@[cluster]/[database]
TRUSTED_FPS=your_device_fingerprint_id
```

## Setup Instructions

### 1. MongoDB Setup
- Create a MongoDB Atlas cluster
- Create a database named `gospel-app`
- Collection `gospels` will be auto-created

### 2. Get Device Fingerprint
- Navigate to `/fingerprint` on your deployed app
- Copy the visitor ID displayed
- Add it to `TRUSTED_FPS` environment variable

### 3. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI production
vercel env add TRUSTED_FPS production  
vercel env add NEXT_PUBLIC_ADMIN_PASSWORD production

# Redeploy with env vars
vercel --prod
```

## Usage Workflows

### Admin Upload Workflow
1. PWA install redirects trusted devices to `/admin-upload`
2. Auto-authentication via fingerprint check
3. Upload text and/or image for specific date
4. Redirect to dashboard showing uploaded content

### Public Access Workflow  
1. Browse daily gospel readings
2. Navigate by date (no future dates)
3. Share images via native share API
4. SEO-optimized with structured data

## Technical Implementation

### Authentication Flow
```
1. Load FingerprintJS on page mount
2. GET /api/check-trusted?fp={visitorId}
3. If trusted: setAuthenticated(true) or redirect to admin
4. If not trusted: require password authentication
```

### Upload API
```
POST /api/gospel
FormData: { date, text?, image? }
Response: { success: true } or { error: string }
```

### PWA Manifest
- `start_url: "/admin-upload"` for trusted device direct access
- Standalone display mode
- Custom icons and theme colors

## File Structure
```
app/
├── page.tsx                 # Home/dashboard with date navigation
├── admin-upload/page.tsx    # Admin upload interface
├── fingerprint/page.tsx     # Device fingerprint display
└── api/
    ├── gospel/route.ts      # CRUD operations for gospel content
    └── check-trusted/route.ts # Fingerprint validation
```

## Security Considerations
- Fingerprint-based device trust (not user authentication)
- Admin password fallback for non-trusted devices
- Input validation on file uploads (size, type)
- Environment variables for sensitive data
- Client-side fingerprinting only for convenience

## Browser Support
- Modern browsers with PWA support
- Native Share API where available
- Clipboard API with graceful fallbacks
- Camera capture on mobile devices

## Troubleshooting

### Common Issues
1. **PWA not redirecting**: Check `TRUSTED_FPS` env var and fingerprint ID
2. **Upload failing**: Verify MongoDB connection and collection permissions
3. **Images not displaying**: Check base64 encoding and content-type headers
4. **Fingerprint changing**: FingerprintJS IDs can change, re-capture if needed

### Debug Mode
Add `?mode=admin` to home URL to show admin link in development.
