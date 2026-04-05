NEXT SESSION PLAN
=================
GOAL: Club detail page + add a book to a club.

Clubs exist and you can create/join them, but tapping a card does nothing.
The natural next step is making clubs useful — see who's in them and add a book.

--- START COMMANDS ---
# Terminal 1 — repo root
docker-compose up -d

# Terminal 2 — backend
cd backend/Booker.API
dotnet run

# Terminal 3 — frontend
cd frontend
npm run dev

--- PART 1: Club Detail Page ---

1. Add route in App.tsx:
   <Route path="/clubs/:id" element={<ClubDetail />} />

2. Make ClubCard navigate on click:
   const navigate = useNavigate()
   onClick={() => navigate(`/clubs/${club.id}`)}

3. Create ClubDetail.tsx page (src/pages/ClubDetail.tsx):
   - Fetch club by ID: GET /api/club/{id}
   - Show club name, description, public/private badge
   - Member list (need new endpoint — see Part 2)

4. Add GET /api/club/{id}/member endpoint (ClubController):
   - Returns list of ClubMembers with User details (name)
   - Joins ClubMembers → Users
   - Add IClubRepository.GetMembersAsync(clubId)
   - Only members can call this [Authorize + membership check]

5. Frontend:
   - useClubMembers(clubId) hook
   - MemberList component: avatar initial + name + role badge

--- PART 2: Add a Book to a Club ---

Backend:
6. Google Books API service (Booker.Infrastructure/Services/GoogleBooksService.cs):
   - SearchBooks(query) → calls https://www.googleapis.com/books/v1/volumes?q=...
   - GetBookByGoogleId(id) → single volume lookup
   - Map to Book entity
   - Store API key in appsettings (get free key from Google Cloud Console)

7. Book endpoints (new BookController.cs, route: /api/book):
   GET  /api/book/search?q={query}   — search Google Books, return results
   POST /api/book                    — save a book to the DB (if not already there)

8. ClubBook endpoint:
   POST /api/club/{id}/book          — add a book to a club (body: bookId, status)
   GET  /api/club/{id}/book          — list books in a club

Frontend:
9. BookSearch.tsx component:
   - Text input → debounced search → results from GET /api/book/search
   - Each result: cover thumbnail, title, author, "Add" button

10. Wire into ClubDetail page:
    - "Add a book" button → opens BookSearch modal
    - On select: POST /api/club/{id}/book
    - Club book list renders below members

--- PART 3: Club Books List ---

11. ClubBookCard.tsx — shows cover, title, author, status badge (reading / completed / upcoming)
12. GET /api/club/{id}/book — fetches ClubBooks joined with Books
13. useClubBooks(clubId) hook

--- FUTURE FEATURE: Local Bookstore Stock ---
When a book is being viewed or added to a club, surface nearby independent
bookstore availability so members can buy local instead of Amazon.

Approach:
- Use Bookshop.org affiliate API or IndieBound store locator (both support ISBN lookup)
- Ask for user's location once (browser geolocation or manual postcode) — store on User record
- Backend: GET /api/book/{id}/stock?postcode={postcode}
  - Calls Bookshop.org / IndieBound API with ISBN + location
  - Returns list of nearby stores with stock status + link to buy
- Frontend: "Find in a local store" button on BookDetail — shows store list in a sheet/modal
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
  POST /api/club/{id}/vote/close      — admin closes, winner becomes next ClubBook
- Frontend: VotingBallot.tsx — list of nominated books with vote counts, Vote button per entry

--- FUTURE FEATURE: Book Rating ---
Members rate and review the book the club just finished.

- Add rating (1–5) + review (text, optional) fields to ClubBook per user
- New table: ClubBookRating (id, club_book_id, user_id, rating, review, created_at)
- Backend:
  POST /api/club/{id}/book/{bookId}/rating   — submit or update rating
  GET  /api/club/{id}/book/{bookId}/rating   — all ratings for a club book
- Frontend: star rating widget on ClubBookCard for completed books, aggregate score shown

--- FUTURE FEATURE: Theme Suggestion Box ---
Members can anonymously suggest themes for the next book pick (e.g. "something gothic", "set in Japan").

- Suggestions table: (id, club_id, content, created_at) — no user_id, anonymous by design
- Backend:
  POST /api/club/{id}/suggestion     — submit a theme suggestion
  GET  /api/club/{id}/suggestion     — list suggestions (admin/members only)
  DELETE /api/suggestion/{id}        — admin moderation
- Frontend: simple text input + list in club dashboard, shown before voting opens

--- NOTES ---
- Google Books API free tier: 1000 req/day, no key needed for low volume but add one anyway
- Cache book searches in memory (React Query staleTime) — no Redis needed yet
- Status values for ClubBook: "upcoming" | "reading" | "completed"
- Don't build reading progress tracking this session — just get a book attached to a club
