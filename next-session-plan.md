NEXT SESSION PLAN
=================
GOAL: Add a book to a meeting.

The club detail page is built — members, meetings, frequency, retroactive add all work.
The natural next step is letting the owner attach a book to a meeting via Google Books search.

--- START COMMANDS ---
# Terminal 1 — repo root
docker-compose up -d

# Terminal 2 — backend
cd backend/Booker.API
dotnet run

# Terminal 3 — frontend
cd frontend
npm run dev

--- PART 1: Google Books + Book endpoints ---

Backend:
1. GoogleBooksService (Booker.Infrastructure/Services/GoogleBooksService.cs):
   - SearchBooks(query) → GET https://www.googleapis.com/books/v1/volumes?q=...
   - Map to a BookSearchResult DTO (googleId, title, author, coverUrl, isbn)
   - Store API key in appsettings.json (free key from Google Cloud Console)
   - Register as IBookSearchService in Program.cs

2. BookController (Booker.API/Controllers/BookController.cs, route: /api/book):
   GET  /api/book/search?q={query}  — calls GoogleBooksService, returns DTO list (no DB write)
   POST /api/book                   — upsert: save book to DB by ISBN if not already there, return Book

--- PART 2: Attach book to a meeting ---

Backend:
3. MeetingController already has PATCH /api/club/{id}/meeting/{meetingId}
   - Body accepts BookId (Guid) — already wired
   - The POST /api/book endpoint returns a Guid after upsert, use that as BookId

Frontend:
4. BookSearch.tsx component (src/components/clubs/BookSearch.tsx):
   - Text input → debounced (300ms) → GET /api/book/search?q=...
   - Results list: cover thumbnail, title, author, "Select" button
   - On select: POST /api/book to upsert → get back Guid → PATCH meeting with bookId

5. Wire into ClubDetail:
   - Each meeting card (owner view): "Add book" button if no book, "Change book" if one exists
   - Opens BookSearch in a bottom sheet modal
   - On success: invalidate meetings query → card updates inline

--- PART 3: Meeting card polish ---

6. If a meeting has a book and a cover URL, show the cover thumbnail on the meeting card
   - Small 40×60px cover on the left, text on the right
   - Keep "No book selected" placeholder when empty

--- FUTURE FEATURE: Local Bookstore Stock ---
When a book is being viewed or added to a meeting, surface nearby independent
bookstore availability so members can buy local instead of Amazon.

Approach:
- Use Bookshop.org affiliate API or IndieBound store locator (both support ISBN lookup)
- Ask for user's location once (browser geolocation or manual postcode) — store on User record
- Backend: GET /api/book/{id}/stock?postcode={postcode}
  - Calls Bookshop.org / IndieBound API with ISBN + location
  - Returns list of nearby stores with stock status + link to buy
- Frontend: "Find in a local store" button on meeting card — shows store list in a sheet/modal
- Cache results in Redis by ISBN + postcode (stock data changes slowly, 6hr TTL is fine)

--- FUTURE FEATURE: Book Voting ---
Club members nominate and vote on the next book democratically.

- Nominations table: (id, club_id, book_id, nominated_by, created_at)
- Votes table: (id, nomination_id, user_id, created_at) — one vote per user per nomination
- VotingPeriod table: (id, club_id, start_date, end_date, status: open/closed)
- Backend:
  POST /api/club/{id}/vote/open       — admin opens a voting period
  POST /api/club/{id}/nomination      — member nominates a book
  POST /api/nomination/{id}/vote      — member casts vote
  GET  /api/club/{id}/vote            — current nominations + vote counts
  POST /api/club/{id}/vote/close      — admin closes, winner attached to next meeting
- Frontend: VotingBallot.tsx — list of nominated books with vote counts, Vote button per entry

--- FUTURE FEATURE: Book Rating ---
Members rate and review the book the club just finished.

- New table: MeetingRating (id, meeting_id, user_id, rating 1–5, review text?, created_at)
- Backend:
  POST /api/club/{id}/meeting/{meetingId}/rating   — submit or update rating
  GET  /api/club/{id}/meeting/{meetingId}/rating   — all ratings for a meeting
- Frontend: star rating widget on past meeting cards, aggregate score shown

--- FUTURE FEATURE: Theme Suggestion Box ---
Members can anonymously suggest themes for the next book pick (e.g. "something gothic", "set in Japan").

- Suggestions table: (id, club_id, content, created_at) — no user_id, anonymous by design
- Backend:
  POST /api/club/{id}/suggestion     — submit a theme suggestion
  GET  /api/club/{id}/suggestion     — list suggestions (admin/members only)
  DELETE /api/suggestion/{id}        — admin moderation
- Frontend: simple text input + list in club dashboard, shown before voting opens

--- NOTES ---
- Google Books API free tier: 1000 req/day, no key needed for low volume but get one anyway
- Cache book search results in React Query (staleTime: 60s) — no Redis needed yet
- ISBN may be missing for some Google Books results — handle gracefully (omit on upsert, don't unique-index fail)
- MeetingController.UpdateAsync already accepts BookId — no backend model changes needed
