BOOKER - PROGRESS LOG
=====================
App: Book club management platform
Stack: React 19 + TypeScript + Vite + Tailwind | .NET 10 Web API | PostgreSQL 16 + Redis 7 | Auth0

---

SESSION 1 - 2026-03-29
-----------------------
COMPLETED:
- Project structure: frontend + backend + Docker Compose
- React 19 + TypeScript + Vite + Tailwind CSS
- Local fonts: Cormorant Garamond (display) + DM Sans (sans)
- .NET 10 backend, clean architecture: Booker.API / Booker.Core / Booker.Infrastructure
- PostgreSQL 16 + Redis 7 in Docker Compose
- All frontend dependencies: React Query, Axios, React Router, Auth0, lucide-react
- Auth0 tenant configured
  - Domain: dev-uwc8uu34nerz42zj.us.auth0.com
  - Audience: https://booker-api
  - Callbacks/Origins: http://localhost:5173
- JWT Bearer auth wired into .NET (Program.cs)
- Auth0Provider + BrowserRouter + QueryClientProvider in main.tsx
- Auth0ProviderWithNavigate (fixes router/callback loop)
- ProtectedRoute (useEffect pattern — fixes StrictMode double-invoke)
- AppLayout: TopBar + BottomNav (Books / Clubs / Account / Settings)
- Home page: personalised greeting using first name
- Sign out in TopBar
- End-to-end login flow working

---

SESSION 2 - 2026-04-05
-----------------------
COMPLETED:
- EF Core wired up (Npgsql provider)
- BookerDbContext with DbSets: Users, Clubs, ClubMembers, Books, ClubBooks
- Entities: User, Club, ClubMember, Book, ClubBook
  - Unique indices: User.Auth0Id, User.Email, Book.Isbn
  - Composite unique index: ClubMembers(ClubId, UserId)
  - Cascade deletes on ClubMembers + ClubBooks
- Migration: InitialCreate (2026-04-05) — all 5 tables, indices, FKs
- DB running and verified

- Full user sync flow:
  - GET /api/user — fetches user by Auth0Id, 404 if not found
  - POST /api/user — creates user on first login (syncs Auth0 profile)
  - PATCH /api/user — updates display name
  - IUserRepository + UserRepository + IUserService + UserService

- Full club management:
  - GET /api/club — public clubs (no auth)
  - GET /api/club/{id} — club detail (no auth)
  - GET /api/user/club — current user's clubs [auth]
  - POST /api/club — create club [auth] (also adds creator as owner in ClubMembers)
  - POST /api/club/{id}/join — join club [auth] (duplicate-safe)
  - IClubRepository + ClubRepository + IClubService + ClubService

- Frontend hooks:
  - useCurrentUser() — fetches user, auto-syncs on first login
  - usePublicClubs(), useMyClubs(), useCreateClub(), useJoinClub()

- Frontend API layer:
  - createApiClient(token) — authenticated Axios instance
  - publicApiClient — unauthenticated for public endpoints
  - Base URL: http://localhost:5240/api

- Clubs page:
  - "My Clubs" section (user's clubs)
  - "Discover" section (public clubs not yet joined)
  - CreateClubForm modal (name, description, public toggle)
  - ClubCard with Join button / Member badge

- Settings page:
  - Tab rail: Profile / Account / Reading / Notifications / Privacy
  - Profile tab: edit display name (from API, not Auth0 cache), view email, member since
  - Other tabs: placeholder

- Endpoint naming: all singular (/club, /user) for cleaner network tab

---

SESSION 3 - 2026-04-07
-----------------------
COMPLETED:
- Data model redesign: ClubBook replaced by Meeting entity
  - Meeting: Id, ClubId, BookId (nullable), ScheduledDate, AddedByUserId, Notes?, CreatedAt
  - Club gains MeetingFrequency (nullable string enum: Fortnightly | Monthly)
  - MeetingFrequency enum stored as string in DB via HasConversion<string>()
  - Migration: AddMeetingsDropClubBooks — drops ClubBooks, adds Meetings + MeetingFrequency column

- New backend endpoints:
  - GET  /api/club/{id}/member         — members list with user name + role [auth, members only]
  - PATCH /api/club/{id}/frequency     — update meeting frequency [auth, owner only]
  - GET  /api/club/{id}/meeting        — all meetings ordered by date desc [auth, members only]
  - POST /api/club/{id}/meeting        — create meeting with date + notes [auth, owner only]
  - PATCH /api/club/{id}/meeting/{id}  — update date, bookId, notes [auth, owner only]
  - IMeetingRepository + MeetingRepository + IMeetingService + MeetingService

- ClubDetail page (src/pages/ClubDetail.tsx):
  - Club name, description, public/private badge, created date
  - Meeting frequency selector (owner only) — updates live
  - Members list with avatar initial + name + owner badge
  - Meetings list: date, past/upcoming badge, book (or placeholder), notes
  - Add meeting modal: manual date input + notes, pre-filled with suggested next date
  - Suggested next date shown below meetings list when frequency is set
  - ClubCard now navigates to /clubs/:id on click (members only)

---

SESSION 4 - 2026-06-09
-----------------------
COMPLETED:
- Book entity updated: Isbn nullable, GoogleBookId added (unique index), Pages nullable, CoverUrl nullable
  - Migration: UpdateBookEntity
- GoogleBooksService (IBookSearchService) — searches Google Books API, maps to BookSearchResult DTO
  - API key stored in appsettings.Development.json
  - Registered via AddHttpClient<IBookSearchService, GoogleBooksService>()
- BookController:
  - GET  /api/book/search?q={query} — calls GoogleBooksService, no DB write
  - POST /api/book                  — upsert by GoogleBookId, returns Book with Guid
- IBookRepository + BookRepository + IBookService + BookService
- BookSearchModal.tsx — debounced search, cover thumbnails, Select → upsert → PATCH meeting
- Meeting cards updated: cover thumbnail (40×60px), "Add book" / "Change book" button (owner only)
- Home page redesigned:
  - Nav "Books" renamed to "Home", points to /
  - Shows next upcoming meeting card across all user's clubs
  - Book cover, title, author, reading time estimate (pages ÷ 60 hrs)
  - Book description fetched live from Google Books API using googleBookId
  - Date countdown ("In X days" / "Tomorrow" / "Today")
  - Club name shown below date
  - Clicking card navigates to ClubDetail
- GET /api/user/next-meeting — finds soonest upcoming meeting across user's clubs
- Framer Motion page transitions (150ms fade + 6px lift, exit fade only)

KNOWN ISSUES / NOTES:
- Page transitions animate in before data loads (double visual update) — not yet fixed
- Account page is a placeholder
- Mobile safe area insets not applied (needed before PWA)
- Redis wired in Docker but not used in app yet

---
