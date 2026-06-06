# FeedUp — Anonymous Feedback Platform

A full-stack anonymous feedback platform where users share thoughts freely, upvote the best ones, and admins moderate content.

**Live Demo:** [feed-up-puce.vercel.app](https://feed-up-puce.vercel.app)  
**Backend API:** [feedup-1-hl51.onrender.com](https://feedup-1-hl51.onrender.com)  
**GitHub:** [github.com/akshitmalia/FeedUp](https://github.com/akshitmalia/FeedUp)

---

## What It Does

FeedUp lets anyone with an account post anonymous feedback visible to all users. Others can upvote posts they agree with. The most voted posts rise to the top. An admin can delete posts and block users who misuse the platform.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | HTTP server and routing |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JSON Web Tokens (JWT) | Stateless authentication |
| bcryptjs | Password hashing |
| Cookie Parser | Reading httpOnly cookies |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI component library |
| Vite | Build tool and dev server |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| Axios | HTTP requests with interceptors |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualization charts |

### Deployment
| Service | Purpose |
|---|---|
| Render | Backend hosting (Node.js) |
| Vercel | Frontend hosting (Static SPA) |
| MongoDB Atlas | Database hosting |

---

## Architecture

FeedUp follows the **MVC (Model-View-Controller)** pattern on the backend and a feature-based component structure on the frontend.

```
Client (React + Redux)
        │
        │ HTTPS + httpOnly Cookie
        ▼
   Express Server
        │
   ┌────┴────┐
   │  Routes │  authRoutes / feedRoutes / adminRoutes
   └────┬────┘
        │
   ┌────┴──────────┐
   │  Middleware   │  authenticate.js (JWT) → isAdmin.js (role check)
   └────┬──────────┘
        │
   ┌────┴────────────┐
   │  Controllers    │  authController / feedController / adminController
   └────┬────────────┘
        │
   ┌────┴────┐
   │ MongoDB │  User Schema / Post Schema
   └─────────┘
```

---

## Project Structure

```
FeedbackPlatform_Major_Project/
├── backend/
│   ├── config/
│   │   └── db.js                  MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      register, login, getMe
│   │   ├── feedController.js      CRUD posts, upvote, signout
│   │   └── adminController.js     stats, users, block, delete any post
│   ├── middleware/
│   │   ├── authenticate.js        verifies JWT, checks isBlocked
│   │   └── isAdmin.js             role === admin guard
│   ├── models/
│   │   ├── userschema.js          email, password, role, isBlocked, posts[]
│   │   └── postschema.js          post, userId, votes, upvotedBy[]
│   ├── routes/
│   │   ├── authRoutes.js          /register /login /me /signout
│   │   ├── feedRoutes.js          /posts CRUD + upvote
│   │   └── adminRoutes.js         /stats /users /posts
│   ├── .env
│   └── server.js                  Express entry point
│
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── axios.js           Axios instance + 403 interceptor
│       │   ├── authAPI.js         register, login, logout, getMe
│       │   ├── feedAPI.js         all feed API calls
│       │   └── adminAPI.js        all admin API calls
│       ├── components/
│       │   ├── Navbar.jsx         responsive nav with hamburger menu
│       │   ├── PostCard.jsx       standalone post card component
│       │   ├── FeedForm.jsx       create post form component
│       │   └── ProtectedRoute.jsx auth + role guard for routes
│       ├── pages/
│       │   ├── Landing.jsx        public landing page
│       │   ├── Login.jsx          login form
│       │   ├── Register.jsx       register form
│       │   ├── Home.jsx           main feed with tabs
│       │   ├── UserDashboard.jsx  personal stats + charts
│       │   └── AdminDashboard.jsx platform stats + moderation
│       ├── redux/
│       │   ├── store.js
│       │   └── slices/
│       │       ├── authSlice.js   user session state + restoreSession thunk
│       │       ├── feedSlice.js   posts state
│       │       └── adminSlice.js  admin state
│       ├── App.jsx                route definitions
│       └── main.jsx               restoreSession before first render
│
├── vercel.json                    SPA rewrite rules
└── package.json
```

---

## Key Features Explained

### Anonymous Posting
Posts are stored with a `userId` reference but the UI never displays who posted what. Only admins can see the email associated with a post.

### JWT + httpOnly Cookie Auth
On login the server signs a JWT and sends it as an httpOnly cookie. The browser stores and sends it automatically with every request. JavaScript cannot read httpOnly cookies — this prevents XSS attacks from stealing tokens. On page refresh, `restoreSession` calls `/feedup/me` to rehydrate Redux state from the cookie before the first render.

### Role-Based Access Control
Every protected route passes through `authenticate.js` which verifies the JWT and checks `isBlocked`. Admin routes additionally pass through `isAdmin.js` which checks `role === "admin"`. On the frontend, `ProtectedRoute` handles both auth and admin-only page access.

### Upvote System
Users can upvote any post they did not write. Upvoting again removes the vote (toggle). The `upvotedBy` array stores user IDs to prevent multiple votes per user.

### Component Architecture
`PostCard` and `FeedForm` are defined as standalone components outside their parent. Defining components inside a parent causes React to unmount and remount them on every re-render, which breaks textarea focus during editing. Standalone components are stable references that React updates via props instead of recreating.

### Minimal Dependencies
The project uses Unicode characters `☰` (U+2630) and `✕` (U+2715) for the hamburger menu instead of an icon library. This avoids adding 300-500KB to the bundle for two symbols. Every dependency has a specific justified purpose.

---

## API Reference

### Auth Routes — `/feedup`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account, sets cookie |
| POST | `/login` | No | Login, sets cookie |
| GET | `/me` | Yes | Returns current user from cookie |
| GET | `/signout` | Yes | Clears cookie |

### Feed Routes — `/feedup`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/posts` | Yes | All posts sorted by date |
| GET | `/posts/top` | Yes | Top 5 posts by votes |
| GET | `/posts/my` | Yes | Logged in user's posts |
| POST | `/posts` | Yes | Create new post |
| PUT | `/posts/:id` | Yes | Edit own post |
| DELETE | `/posts/:id` | Yes | Delete own post |
| PATCH | `/posts/:id/upvote` | Yes | Toggle upvote |

### Admin Routes — `/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Total users, posts, top posts |
| GET | `/users` | Admin | All users |
| GET | `/posts` | Admin | All posts with user email |
| DELETE | `/posts/:id` | Admin | Delete any post |
| PATCH | `/users/:id/block` | Admin | Toggle block user |
| GET | `/user/stats` | Yes | Personal stats for dashboard |

---

## Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone
```bash
git clone https://github.com/akshitmalia/FeedUp.git
cd FeedUp
```

### 2. Environment Variables

Create `backend/.env`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
topSecret=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
PORT=3000
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
# From project root
npm install

# Frontend
cd frontend && npm install
```

### 4. Run

Terminal 1 — Backend:
```bash
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/akshit/

---

## Deployment

### Backend on Render
- **Start Command:** `node backend/server.js`
- **Environment Variables:** `MONGODB_URI`, `topSecret`, `CLIENT_URL`, `PORT`
- **Note:** Free tier spins down after 15 minutes of inactivity. Use [cron-job.org](https://cron-job.org) to ping `/akshit/` every 14 minutes to prevent cold starts.

### Frontend on Vercel
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** `VITE_API_URL=https://your-render-url.onrender.com`
- **Routing:** `vercel.json` rewrites all paths to `index.html` for SPA routing

---

## Scalability Considerations

- **Stateless Auth:** JWT means the server holds no session state. Multiple server instances can handle requests without shared session storage.
- **MongoDB Atlas:** Cloud-hosted with automatic scaling. Indexes on `userId` and `votes` keep queries fast as data grows.
- **Component Design:** PostCard and FeedForm are isolated. Adding features like comments or reactions only requires changes to those files.
- **Axios Interceptors:** The 403 blocked-user response is handled globally in one place rather than in every API call.

---

## Developer

**Akshit Malia**  
[GitHub](https://github.com/akshitmalia/FeedUp)

---

## License

MIT
