I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

## Key Observations

The workspace at `c:\Users\ayush\Desktop\major\` is empty, requiring complete project initialization from scratch. This is a monorepo setup with separate `client/` (Next.js) and `server/` (Express) directories. The stack uses Next.js with TypeScript and Tailwind CSS for frontend, Express with TypeScript for backend, MongoDB with Mongoose, and Firebase for authentication and storage. All dependencies need to be installed and configured.

## Approach

The implementation follows a bottom-up approach: first establishing the project structure with separate client and server directories, then installing and configuring all required dependencies (Next.js, Express, TypeScript, Tailwind, MongoDB, Firebase), and finally setting up environment configuration templates. This ensures a solid foundation for subsequent development phases while maintaining clear separation of concerns between frontend and backend.

## Implementation Steps

### 1. Initialize Root Project Structure

Create the monorepo structure with proper Git initialization:

- Initialize Git repository in `c:\Users\ayush\Desktop\major\`
- Create root-level `.gitignore` with entries for `node_modules/`, `.env`, `.env.local`, `dist/`, `build/`, `.next/`, and IDE-specific files
- Create root `README.md` with project overview, tech stack, and setup instructions
- Create `client/` and `server/` directories at root level

### 2. Setup Next.js Frontend (client/)

Initialize the Next.js application with TypeScript and Tailwind CSS:

**Project Initialization:**
- Navigate to `client/` directory
- Run `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"`
- This creates Next.js 14+ with App Router, TypeScript, Tailwind CSS, and `src/` directory structure

**Install Additional Dependencies:**
- Install Firebase SDK: `npm install firebase`
- Install Leaflet for maps: `npm install leaflet react-leaflet`
- Install Leaflet types: `npm install -D @types/leaflet`
- Install form handling: `npm install react-hook-form`
- Install UI utilities: `npm install clsx tailwind-merge`
- Install date utilities: `npm install date-fns`

**Folder Structure Creation:**
Create the following directories inside `client/src/`:
- `components/` - Reusable UI components
- `lib/` - Utility functions, Firebase config, storage helpers
- `context/` - React Context providers (AuthContext, etc.)
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `styles/` - Global styles and Tailwind config extensions
- `utils/` - Helper functions and constants

**Tailwind Configuration:**
- Update `client/tailwind.config.ts` to include custom color palette for civic theme (primary: blue, secondary: green, accent: orange)
- Add custom spacing and breakpoints for responsive design
- Configure content paths to include all component directories

**TypeScript Configuration:**
- Verify `client/tsconfig.json` has strict mode enabled
- Ensure path aliases are configured (`@/components`, `@/lib`, etc.)
- Add `baseUrl` and `paths` for clean imports

### 3. Setup Express Backend (server/)

Initialize the Express server with TypeScript support:

**Project Initialization:**
- Navigate to `server/` directory
- Run `npm init -y` to create `package.json`
- Install core dependencies:
  - Express: `npm install express`
  - TypeScript: `npm install -D typescript @types/node @types/express`
  - Development tools: `npm install -D ts-node nodemon`
  - Environment variables: `npm install dotenv`
  - CORS: `npm install cors @types/cors`
  - Body parser: `npm install body-parser`

**Install Database & Firebase:**
- MongoDB driver: `npm install mongoose`
- Firebase Admin SDK: `npm install firebase-admin`

**TypeScript Configuration:**
- Create `server/tsconfig.json` with:
  - `target`: "ES2020"
  - `module`: "commonjs"
  - `outDir`: "./dist"
  - `rootDir`: "./src"
  - `strict`: true
  - `esModuleInterop`: true
  - `skipLibCheck`: true

**Folder Structure Creation:**
Create the following directories inside `server/src/`:
- `routes/` - API route handlers
- `models/` - Mongoose schemas and models
- `controllers/` - Business logic for routes
- `middleware/` - Authentication, error handling, validation middleware
- `config/` - Configuration files (database, Firebase)
- `services/` - External service integrations (SMS, Firebase Storage)
- `utils/` - Helper functions and constants
- `types/` - TypeScript type definitions

**Package.json Scripts:**
Add scripts to `server/package.json`:
- `"dev": "nodemon --exec ts-node src/index.ts"`
- `"build": "tsc"`
- `"start": "node dist/index.js"`
- `"type-check": "tsc --noEmit"`

### 4. MongoDB Connection Setup

Configure Mongoose ODM for MongoDB:

**Create Database Configuration:**
- Create `server/src/config/database.ts`
- Export `connectDB` async function that:
  - Reads MongoDB URI from environment variable `MONGODB_URI`
  - Uses `mongoose.connect()` with options: `useNewUrlParser`, `useUnifiedTopology`
  - Implements connection error handling with try-catch
  - Logs successful connection with database name
  - Handles connection events: `connected`, `error`, `disconnected`

**Connection Implementation:**
- Import `connectDB` in `server/src/index.ts`
- Call `connectDB()` before starting Express server
- Ensure graceful shutdown on process termination (SIGINT, SIGTERM)

**Mongoose Configuration:**
- Set `mongoose.set('strictQuery', false)` for flexibility
- Enable debug mode in development: `mongoose.set('debug', process.env.NODE_ENV === 'development')`

### 5. Firebase SDK Configuration

Setup Firebase for both client and server:

**Client-Side Firebase (client/src/lib/firebase.ts):**
- Import `initializeApp`, `getAuth`, `getStorage` from Firebase SDK
- Create Firebase config object with keys: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
- Read config from environment variables: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.
- Initialize Firebase app: `const app = initializeApp(firebaseConfig)`
- Export `auth` instance: `export const auth = getAuth(app)`
- Export `storage` instance: `export const storage = getStorage(app)`
- Export authentication providers: `GoogleAuthProvider`, `FacebookAuthProvider`

**Server-Side Firebase (server/src/config/firebase.ts):**
- Import `admin` from `firebase-admin`
- Initialize Firebase Admin SDK using service account:
  - Read `FIREBASE_SERVICE_ACCOUNT_PATH` from environment
  - Use `admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })`
- Export `admin` instance for token verification in authentication middleware
- Export `adminAuth` instance: `export const adminAuth = admin.auth()`

**Firebase Storage Helper (client/src/lib/storage.ts):**
- Create utility functions for file uploads:
  - `uploadFile(file: File, path: string)` - uploads to Firebase Storage
  - `getDownloadURL(path: string)` - retrieves public URL
  - `deleteFile(path: string)` - removes file from storage
- Implement upload progress tracking using `uploadBytesResumable`
- Add file type validation (images: jpg, png, jpeg; videos: mp4, mov)
- Add file size limits (images: 5MB, videos: 50MB)

### 6. Environment Variables Configuration

Create environment variable templates for both client and server:

**Client Environment (.env.local template):**
Create `client/.env.example` with:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Server Environment (.env template):**
Create `server/.env.example` with:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/civicvoice

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# SMS Service (Twilio/MSG91/Fast2SMS)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=your_sender_id

# JWT Secret (for additional security)
JWT_SECRET=your_jwt_secret_key

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**Security Notes:**
- Add `.env`, `.env.local`, `serviceAccountKey.json` to `.gitignore`
- Document how to obtain Firebase service account key in README
- Include instructions for MongoDB setup (local vs. MongoDB Atlas)

### 7. Express Server Entry Point

Create the main Express application:

**Server Entry File (server/src/index.ts):**
- Import required modules: `express`, `cors`, `dotenv`, `body-parser`
- Load environment variables: `dotenv.config()`
- Initialize Express app: `const app = express()`
- Configure middleware:
  - CORS: `app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))`
  - Body parser: `app.use(express.json())`, `app.use(express.urlencoded({ extended: true }))`
  - Request logging in development
- Create health check route: `app.get('/health', (req, res) => res.json({ status: 'ok' }))`
- Setup API route prefix: `app.use('/api', apiRoutes)` (placeholder for now)
- Implement 404 handler for undefined routes
- Add global error handling middleware
- Connect to MongoDB using `connectDB()`
- Start server: `app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))`

**Error Handling Middleware (server/src/middleware/errorHandler.ts):**
- Create error handler with signature: `(err, req, res, next)`
- Log error stack in development mode
- Return JSON response with error message and status code
- Handle specific error types: MongoDB validation errors, Firebase errors, etc.

### 8. Next.js App Router Setup

Configure Next.js App Router structure:

**Root Layout (client/src/app/layout.tsx):**
- Import global styles and Tailwind CSS
- Setup HTML structure with metadata
- Add font configuration (Inter or custom font)
- Include root-level providers (AuthContext will be added in next phase)
- Configure viewport and theme color metadata

**Home Page (client/src/app/page.tsx):**
- Create landing page with hero section
- Add "Report Issue" CTA button
- Display recent issues preview (placeholder)
- Include statistics cards (total issues, resolved, pending)

**Global Styles (client/src/app/globals.css):**
- Import Tailwind directives: `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- Add custom CSS variables for theme colors
- Define utility classes for common patterns (card, button variants)

### 9. API Routes Structure (Placeholder)

Setup initial API routing structure:

**Main Router (server/src/routes/index.ts):**
- Create Express Router instance
- Import and mount route modules:
  - `/issues` - Issue management routes (placeholder)
  - `/users` - User profile routes (placeholder)
  - `/auth` - Authentication routes (placeholder)
- Export router for use in `index.ts`

**Example Route File (server/src/routes/issues.ts):**
- Create Express Router
- Define placeholder routes:
  - `GET /` - List issues
  - `POST /` - Create issue
  - `GET /:id` - Get issue details
  - `PATCH /:id` - Update issue
  - `DELETE /:id` - Delete issue
- Export router

### 10. Development Workflow Setup

Configure development tools and scripts:

**Root Package.json (Optional Monorepo Management):**
- Create `package.json` at root with scripts:
  - `"dev:client": "cd client && npm run dev"`
  - `"dev:server": "cd server && npm run dev"`
  - `"dev": "concurrently \"npm run dev:client\" \"npm run dev:server\""`
- Install `concurrently` for parallel execution: `npm install -D concurrently`

**ESLint & Prettier (Optional but Recommended):**
- Client already has ESLint from Next.js setup
- Add Prettier to both client and server:
  - `npm install -D prettier eslint-config-prettier`
- Create `.prettierrc` with formatting rules
- Add format scripts to package.json

**Git Hooks (Optional):**
- Install Husky for pre-commit hooks: `npm install -D husky`
- Setup lint-staged for staged file linting
- Configure pre-commit hook to run type-check and lint

### 11. Verification & Testing

Validate the setup:

**Client Verification:**
- Run `cd client && npm run dev`
- Verify Next.js starts on `http://localhost:3000`
- Check Tailwind CSS is working (add test styles)
- Verify TypeScript compilation (no errors)

**Server Verification:**
- Run `cd server && npm run dev`
- Verify Express starts on `http://localhost:5000`
- Test health check endpoint: `GET http://localhost:5000/health`
- Verify MongoDB connection (check console logs)
- Verify TypeScript compilation (no errors)

**Integration Testing:**
- Test CORS by making API call from Next.js frontend
- Verify environment variables are loaded correctly
- Check Firebase SDK initialization (no errors in console)

## Project Structure Diagram

```
major/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home page
│   │   │   └── globals.css          # Global styles
│   │   ├── components/              # Reusable components
│   │   ├── lib/                     # Utilities & configs
│   │   │   ├── firebase.ts          # Firebase client config
│   │   │   └── storage.ts           # Storage helpers
│   │   ├── context/                 # React contexts
│   │   ├── hooks/                   # Custom hooks
│   │   ├── types/                   # TypeScript types
│   │   └── utils/                   # Helper functions
│   ├── public/                      # Static assets
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── routes/                  # API routes
│   │   │   ├── index.ts             # Main router
│   │   │   └── issues.ts            # Issues routes
│   │   ├── models/                  # Mongoose models
│   │   ├── controllers/             # Route controllers
│   │   ├── middleware/              # Middleware functions
│   │   │   └── errorHandler.ts      # Error handler
│   │   ├── config/                  # Configuration
│   │   │   ├── database.ts          # MongoDB config
│   │   │   └── firebase.ts          # Firebase Admin config
│   │   ├── services/                # External services
│   │   ├── utils/                   # Helper functions
│   │   ├── types/                   # TypeScript types
│   │   └── index.ts                 # Server entry point
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore                       # Root gitignore
└── README.md                        # Project documentation
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 14+ (App Router) | Server-side rendering, routing, optimization |
| Frontend Language | TypeScript | Type safety and better DX |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Backend Framework | Express.js | RESTful API server |
| Backend Language | TypeScript (ts-node) | Type-safe server code |
| Database | MongoDB + Mongoose | NoSQL database with ODM |
| Authentication | Firebase Auth | Social login (Google, Facebook) |
| File Storage | Firebase Storage | Photo/video uploads |
| Maps | Leaflet + OpenStreetMap | GPS tagging and map display |
| Development Tools | nodemon, concurrently | Hot reload and parallel execution |

## Environment Setup Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed locally or MongoDB Atlas account created
- [ ] Firebase project created with Authentication and Storage enabled
- [ ] Google OAuth credentials configured in Firebase Console
- [ ] Facebook OAuth credentials configured in Firebase Console
- [ ] Firebase service account key downloaded
- [ ] Git repository initialized
- [ ] Client dependencies installed (`cd client && npm install`)
- [ ] Server dependencies installed (`cd server && npm install`)
- [ ] Environment variables configured (copy `.env.example` to `.env`)
- [ ] MongoDB connection tested
- [ ] Firebase SDK initialized successfully
- [ ] Development servers running (client on :3000, server on :5000)