# FeedUp — Anonymous Feedback Platform

A full-stack anonymous feedback platform where users share thoughts freely, upvote the best ones in real time, and admins moderate content through a dedicated dashboard.

**Live Demo:** [feed-up-puce.vercel.app](https://feed-up-puce.vercel.app)
**Backend API:** [feedup-1-hl51.onrender.com](https://feedup-1-hl51.onrender.com)
**GitHub:** [github.com/akshitmalia/FeedUp](https://github.com/akshitmalia/FeedUp)

---

## What It Does

FeedUp lets anyone with an account post anonymous feedback visible to all users. Others can upvote posts they agree with, and the most-voted posts rise to the top. Every create, edit, delete, and vote is broadcast live to all connected users via Socket.io, with no manual refresh required. Admins can review and delete posts through a dedicated analytics dashboard, while posts themselves never reveal who wrote them to other users.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | HTTP server and routing |
| Socket.io | Real-time bidirectional event broadcasting |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JSON Web Tokens (JWT) | Stateless authentication |
| bcryptjs | Password hashing |
| Cookie Parser | Reading httpOnly cookies |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |
| Jest and Supertest | Backend integration testing |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI component library |
| Vite | Build tool and dev server |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| Axios | HTTP requests with interceptors |
| Socket.io-client | Real-time event listening |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualization charts |

### Deployment
| Service | Purpose |
|---|---|
| Render | Backend hosting (Node.js with Socket.io) |
| Vercel | Frontend hosting (static SPA) |
| MongoDB Atlas | Database hosting |

---

## Architecture

FeedUp follows the MVC (Model-View-Controller) pattern on the backend, with Socket.io layered onto the same HTTP server, and a feature-based component structure on the frontend.

```
Client (React + Redux)
        |
        | HTTPS + httpOnly Cookie  -> REST requests
        | WebSocket                -> live event stream
        v
   Express + Socket.io Server
        |
   ----------
   |  Routes |  authRoutes / feedRoutes / adminRoutes
   ----------
        |
   ----------------
   | Middleware    |  authenticate.js (JWT) -> isAdmin.js (role check)
   ----------------
        |
   ------------------
   | Controllers     |  authController / feedController / adminController
   |                 |  -> emits Socket.io events after each write
   ------------------
        |
   ----------
   | MongoDB |  User Schema / Post Schema
   ----------
```

When a controller successfully creates, updates, deletes, or upvotes a post, it emits a Socket.io event — `post:created`, `post:updated`, `post:deleted`, or `post:upvoted` — to every connected client. The frontend listens for these events and updates Redux state directly, without a follow-up API call.

---

## Project Structure

```
FeedbackPlatform_Major_Project/
├── jest.config.js                 Jest test runner configuration
├── vercel.json                    SPA rewrite rules for Vercel
├── package.json
│
├── backend/
│   ├── server.js                  Express + Socket.io entry point
│   ├── auth.test.js               Jest tests: registration and login
│   ├── feed.test.js               Jest tests: CRUD authorization and upvote logic
│   ├── .env
│   ├── config/
│   │   └── db.js                  MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      register, login, getMe
│   │   ├── feedController.js      CRUD posts, upvote, signout, emits socket events
│   │   └── adminController.js     stats, users, delete any post
│   ├── middleware/
│   │   ├── authenticate.js        verifies JWT, checks isBlocked
│   │   └── isAdmin.js             role === admin guard
│   ├── models/
│   │   ├── userschema.js          email, password, role, posts[]
│   │   └── postschema.js          post, userId, votes, upvotedBy[]
│   └── routes/
│       ├── authRoutes.js          /register /login /me
│       ├── feedRoutes.js          /posts CRUD, upvote, signout
│       └── adminRoutes.js         /stats /users /posts
│
└── frontend/
    └── src/
        ├── App.jsx                route definitions
        ├── main.jsx                restoreSession before first render
        ├── index.css
        ├── api/
        │   ├── axios.js           Axios instance with 403 interceptor
        │   ├── authAPI.js         register, login, logout, getMe
        │   ├── feedAPI.js         all feed API calls
        │   ├── adminAPI.js        all admin API calls
        │   └── socket.js          shared Socket.io client connection
        ├── components/
        │   ├── Navbar.jsx         responsive navigation with mobile menu
        │   ├── PostCard.jsx       standalone post card component
        │   ├── FeedForm.jsx       create post form component
        │   └── ProtectedRoute.jsx auth and role guard for routes
        ├── pages/
        │   ├── Landing.jsx        public landing page
        │   ├── Login.jsx          login form
        │   ├── Register.jsx       register form
        │   ├── Home.jsx           live feed with Socket.io listeners
        │   ├── UserDashboard.jsx  personal stats and charts
        │   └── AdminDashboard.jsx platform stats and post moderation
        └── redux/
            ├── store.js
            └── slices/
                ├── authSlice.js   session state and restoreSession thunk
                ├── feedSlice.js   post state and socket-driven reducers
                └── adminSlice.js  admin state
```

---

## Key Features Explained

### Anonymous Posting
Posts are stored with a `userId` reference, but the UI never displays who posted what. Only admins can see the email associated with a post, and only for moderation purposes.

### Real-Time Updates with Socket.io
Socket.io attaches to the same HTTP server as Express, sharing one port and one CORS configuration. After every successful database write, the relevant controller emits a typed event broadcast to all connected clients. The frontend listens for these events in `Home.jsx` and dispatches dedicated Redux reducers that surgically update a single post inside the existing state array, rather than refetching the entire feed.

### JWT and httpOnly Cookie Authentication
On login, the server signs a JWT and sends it as an httpOnly cookie. The browser stores and sends it automatically with every request. JavaScript cannot read httpOnly cookies, which prevents XSS attacks from stealing tokens. On page refresh, a `restoreSession` Redux thunk calls `/feedup/me` to rehydrate auth state from the cookie before the app renders, so a logged-in user is never incorrectly redirected to the login page.

### Role-Based Access Control
Every protected route passes through `authenticate.js`, which verifies the JWT and attaches the decoded user to the request. Admin-only routes additionally pass through `isAdmin.js`, which checks that the user's role is admin. On the frontend, `ProtectedRoute` mirrors this with both an authentication check and an optional admin-only check, showing a loading state while session restoration is in progress.

### Upvote System
Users can upvote any post they did not write. Upvoting the same post a second time removes the vote, making it a toggle rather than a one-way action. The `upvotedBy` array on each post stores user IDs to prevent the same user from voting more than once.

### Component Architecture
`PostCard` and `FeedForm` are defined as standalone components outside their parent page. Defining a component inside another component causes React to treat it as a new component type on every re-render, unmounting and remounting it, which breaks textarea focus during editing. Standalone components are stable references that React updates through props instead of recreating, which fixes this issue and makes both components independently reusable.

### Backend Testing with Jest
The backend includes 16 Jest and Supertest test cases across two files. `auth.test.js` covers registration, duplicate email rejection, and login with both correct and incorrect credentials. `feed.test.js` covers post creation and, most importantly, ownership-based authorization: confirming a user cannot delete or edit another user's post, cannot upvote their own post, and that upvoting twice correctly toggles the vote off. Tests run sequentially against an isolated MongoDB Atlas test database, kept entirely separate from production data.

### Minimal Dependencies
The project uses Unicode characters for the mobile navigation menu instead of an icon library, avoiding several hundred kilobytes of unnecessary bundle size for two symbols. Every dependency included in the project has a specific, justified purpose.

---

## API Reference

### Auth Routes (`/feedup`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /register | No | Create account, sets JWT cookie |
| POST | /login | No | Login, sets JWT cookie |
| GET | /me | Yes | Returns current user from cookie, used for session rehydration |

### Feed Routes (`/feedup`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /posts | Yes | All posts sorted by date |
| GET | /posts/top | Yes | Top 5 posts by votes |
| GET | /posts/my | Yes | Logged-in user's posts |
| POST | /posts | Yes | Create new post, emits post:created |
| PUT | /posts/:id | Yes | Edit own post, emits post:updated |
| DELETE | /posts/:id | Yes | Delete own post, emits post:deleted |
| PATCH | /posts/:id/upvote | Yes | Toggle upvote, emits post:upvoted |
| GET | /signout | Yes | Clears auth cookie |

### Admin Routes (`/admin`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /stats | Admin | Total users, posts, top posts |
| GET | /users | Admin | All users |
| GET | /posts | Admin | All posts with user email populated |
| DELETE | /posts/:id | Admin | Delete any post |
| GET | /user/stats | Yes | Personal stats for dashboard |

The platform exposes 16 REST endpoints in total across these three route files.

---

## Testing

Run the full backend test suite from the project root:

```
npm test
```

This runs all Jest test suites sequentially against an isolated Atlas test database.

```
PASS  backend/auth.test.js   (6 tests)
PASS  backend/feed.test.js   (10 tests)

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
```

---

## Getting Started Locally

### Prerequisites
- Node.js v18 or higher
- A MongoDB Atlas account (the free tier is sufficient)

### 1. Clone the repository
```
git clone https://github.com/akshitmalia/FeedUp.git
cd FeedUp
```

### 2. Set environment variables

Create `backend/.env`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
TEST_MONGODB_URI=your_separate_test_database_uri
topSecret=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
PORT=3000
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
```

### 3. Install dependencies
```
npm install
cd frontend && npm install
```

### 4. Run the app

In one terminal, from the project root:
```
npm run dev
```

In a second terminal:
```
cd frontend
npm run dev
```

- Frontend runs at http://localhost:5173
- Backend runs at http://localhost:3000
- Health check available at http://localhost:3000/akshit/

---

## Deployment

### Backend on Render
- Start command: `node backend/server.js`
- Environment variables: `MONGODB_URI`, `topSecret`, `CLIENT_URL`, `PORT`
- Note: the free tier spins down after 15 minutes of inactivity. A scheduled ping to `/akshit/` every 14 minutes (for example, through cron-job.org) prevents cold starts.

### Frontend on Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` set to the deployed backend URL
- Routing: `vercel.json` rewrites all paths to `index.html` to support client-side routing

---

## Scalability Considerations

- **Stateless authentication:** JWT means the server holds no session state, so multiple server instances can handle requests without any shared session storage.
- **Real-time at scale:** The current Socket.io setup broadcasts to all connected clients on a single server instance. Scaling to multiple instances would require a Redis adapter for cross-instance pub/sub.
- **Database scaling:** MongoDB Atlas is cloud-hosted with automatic scaling, and indexes on `userId` and `votes` keep queries fast as data grows.
- **Component design:** `PostCard` and `FeedForm` are isolated components, so adding features such as comments or reactions only requires changes to those specific files.
- **Centralized error handling:** Axios interceptors handle global error cases in one place rather than repeating logic across every individual API call.

---

## Developer

Akshit Malia
[GitHub](https://github.com/akshitmalia)

---

## License

MIT
