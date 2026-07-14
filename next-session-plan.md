NEXT SESSION PLAN
=================
Last updated: 2026-07-13

--- START COMMANDS ---
# Terminal 1 — repo root
docker-compose up -d

# Terminal 2 — backend
cd backend/Booker.API
dotnet run

# Terminal 3 — frontend
cd frontend
npm run dev

--- COMPLETED (no longer needed) ---
[x] Page transition double-load fix
[x] Reading status feature (got book / started reading per meeting)
[x] Book search + assignment to meetings
[x] Home dashboard with next meeting, countdown, retailer links
[x] Club owner: edit club name/description inline
[x] Club owner: remove members
[x] Leave club (all members; handles ownership transfer or club deletion)
[x] Account page: view profile + delete account with confirmation
[x] Migration: MakeAddedByNullable (Meeting.AddedByUserId → Guid? with SetNull)

--- PART 1: Fix structural bugs (do these first) ---

BUG 1 — Meeting cross-club authorization bypass (HIGH)
PATCH /api/club/{clubId}/meeting/{meetingId} verifies the requester is an owner
of clubId, but never checks that meetingId actually belongs to that club.
An owner of Club A can modify any meeting in any other club.

Fix in MeetingController.UpdateMeeting:
- After fetching the meeting, check meeting.ClubId == clubId
- Return 404 if mismatch (don't leak that the meeting exists)

BUG 2 — Private clubs readable without auth (HIGH)
GET /api/club/{id} has no [Authorize] and no membership check.
Anyone with a club ID can read a private club's name/description.

Fix in ClubController.GetClub:
- Add [Authorize]
- After getting the club, if !club.IsPublic, verify the caller is a member
- Return 404 (not 403, to avoid leaking existence) if not a member

BUG 3 — API URL hardcoded to localhost (BLOCKS DEPLOYMENT)
frontend/src/lib/apiClient.ts: `const BASE_URL = 'http://localhost:5240/api'`

Fix:
- Change to: const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5240/api'
- Add VITE_API_URL to frontend/.env.example

--- PART 2: Medium-priority structural fixes ---

FIX 4 — Add database indexes on Meeting
No indexes on Meeting.ClubId or Meeting.ScheduledDate, which are the two most
queried columns. Will cause full table scans as data grows.

Fix: Add a migration with:
  modelBuilder.Entity<Meeting>()
    .HasIndex(m => m.ClubId);
  modelBuilder.Entity<Meeting>()
    .HasIndex(m => m.ScheduledDate);

FIX 5 — ClubMember.Role as magic string
"owner" and "member" are hardcoded strings in 5 places. A typo silently bypasses
owner-only authorization.

Fix:
- Add enum: public enum MemberRole { Owner, Member }
- Add to Club.cs area or its own file
- Change ClubMember.Role to MemberRole
- Add .HasConversion<string>() in BookerDbContext (like MeetingFrequency)
- Replace all string comparisons with MemberRole.Owner / MemberRole.Member
- Migration needed

FIX 6 — Input validation at API boundary
No [Required], [MaxLength], or validation on any request DTOs.
Empty names, whitespace-only strings, and huge payloads are accepted.

Fix: Add data annotations to request records:
  public record CreateClubRequest(
    [Required][MaxLength(100)] string Name,
    [MaxLength(500)] string Description,
    bool IsPublic);
  — same pattern for UpdateClubRequest, CreateMeetingRequest
Add builder.Services.AddControllers() already auto-validates with annotations.

FIX 7 — Unhandled FK exception on invalid BookId
PATCH /api/club/{clubId}/meeting/{meetingId} with a non-existent bookId causes
EF to throw an FK violation that bubbles up as unhandled 500.

Fix in MeetingController.UpdateMeeting:
  if (request.BookId.HasValue)
  {
      var bookExists = await bookService.ExistsAsync(request.BookId.Value);
      if (!bookExists) return BadRequest("Book not found");
  }

FIX 8 — No global 401 handling on frontend
When an Auth0 token expires, API calls return 401 but the frontend silently
fails (useNextMeeting swallows all errors). User sees stale/empty data.

Fix: Add an Axios response interceptor in apiClient.ts:
  instance.interceptors.response.use(
    r => r,
    err => {
      if (err.response?.status === 401) {
        // trigger logout / redirect to login
      }
      return Promise.reject(err)
    }
  )
  Note: createApiClient() creates a new instance per call — consider refactoring
  to a single shared instance that updates its auth header instead.

FIX 9 — No React error boundary
Any render-time throw (unexpected null, wrong API shape) white-screens the app.

Fix: Add a simple ErrorBoundary component and wrap AppLayout children with it.

--- PART 3: Low priority housekeeping ---

- Club.CreatedBy is stored but never used for authorization — either remove it
  or start using it (currently auth is entirely through ClubMember.Role)
- Meeting notes cannot be cleared to null via API (UpdateAsync skips null notes)
  Fix: use a separate "clear notes" flag or always update notes field
- No EF concurrency protection (blind last-write-wins on clubs/meetings)

--- FUTURE FEATURE: Portfolio Entry Point ---
The app currently bounces visitors straight to Auth0 login with no context.
A recruiter hits the URL and closes the tab before seeing anything.

PART A — Public landing page
- Add a public / route (move the current app to /app)
- Landing page shows: one-line description, screenshot/preview of the home
  dashboard (meeting card + book cover + bubbles), single "Get started" CTA
- ProtectedRoute wraps /app/* not /
- App.tsx restructure:
    <Route path="/" element={<Landing />} />          ← public
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/app" element={<Home />} />
        <Route path="/app/clubs" element={<Clubs />} />
        <Route path="/app/clubs/:id" element={<ClubDetail />} />
        ... etc
      </Route>
    </Route>
- Update Auth0 redirect_uri and callback URLs to /app
- Update all internal navigate() calls and links from / to /app

PART B — Demo account with seed data
- Create a seeded Auth0 user: demo@booker.app (set password in Auth0 dashboard)
- Seed the DB with: one club ("Sunday Readers"), one upcoming meeting,
  one book assigned (pick something well-known), reading status set
- Link from landing page: "Preview the app →" button that logs in as demo user
- Consider read-only guard on demo account (block delete account, leave club)
  by checking user.email === 'demo@booker.app' in the relevant endpoints

NOTE: deployment of the backend + frontend is a separate discussion.
      Do the landing page and demo account once a deployed URL exists.

--- FUTURE FEATURE: Book Rating ---
Members rate and review the book the club just finished.

- New table: MeetingRating (id, meeting_id, user_id, rating 1–5, review text?, created_at)
- Backend:
  POST /api/club/{id}/meeting/{meetingId}/rating   — submit or update rating
  GET  /api/club/{id}/meeting/{meetingId}/rating   — all ratings for a meeting
- Frontend: star rating widget on past meeting cards, aggregate score shown

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

--- FUTURE FEATURE: Books Page ---
Personal reading history and library across all clubs.
Currently /books route exists but shows "Coming soon".
- List of all books read (past meetings with books) across all user's clubs
- Cover grid or list view
- Tap to see which club read it, when, ratings

--- FUTURE FEATURE: Theme Suggestion Box ---
Members can anonymously suggest themes for the next book pick (e.g. "something gothic", "set in Japan").

- Suggestions table: (id, club_id, content, created_at) — no user_id, anonymous by design
- Backend:
  POST /api/club/{id}/suggestion     — submit a theme suggestion
  GET  /api/club/{id}/suggestion     — list suggestions (members only)
  DELETE /api/suggestion/{id}        — owner moderation
- Frontend: simple text input + list in club detail, shown before voting opens

--- FUTURE FEATURE: Local Bookstore Stock (Australia) ---
Surface nearby independent bookstore availability when a book is assigned to a meeting.

- No clean public API exists yet. Best options:
  - TitlePage API (Australian Publishers Assoc.) — contact titlepage@publishers.asn.au
    for third-party developer access. They are building store-level stock display.
  - CirclePOS per-store API — requires individual OAuth credentials from each store
    (used by Readings, Collins, many independents)
  - Short term: deep-link to Dymocks product page by ISBN (has built-in postcode stock checker)
- Store user postcode on User record for location context

--- FUTURE FEATURE: PWA / Mobile ---
- Safe area insets (padding for notch/home bar)
- manifest.json + service worker
- Add to home screen prompt

--- NOTES ---
- Redis still unused — good candidate for caching reading status counts later
- Angus & Robertson removed from retailer links (online-only since 2011, now Booktopia)
- Amazon AU added to retailer links
- useSuspenseQuery requires React Query v5 (already installed, but not yet adopted)
- The home page bubbles now sit to the right of the meeting card (not below it)
