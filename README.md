# BFHL Full Stack — Round 1

## Backend Setup

```bash
npm install
npm start        # production
npm run dev      # development (needs nodemon)
```

**Before deploying**, edit the three constants at the top of `index.js`:
```js
const USER_ID = "yourfullname_ddmmyyyy";  // e.g. johndoe_17091999
const EMAIL_ID = "your@college.edu";
const ROLL    = "yourrollnumber";
```

## Deploy Backend (Render)
1. Push to GitHub (public repo)
2. Create new Web Service on [render.com](https://render.com)
3. Build command: `npm install` | Start command: `npm start`
4. Your base URL: `https://yourname-bfhl.onrender.com`

## Deploy Frontend (Netlify / Vercel)
Drop `frontend/index.html` into Netlify or Vercel.  
Enter your backend base URL in the UI's "API Base URL" field.

## API

`POST /bfhl`  
Content-Type: application/json  
Body: `{ "data": ["A->B", "B->C", ...] }`
