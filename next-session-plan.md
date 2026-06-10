NEXT SESSION PLAN
=================
GOAL: Reading status checks + fix page transition double-load.

--- START COMMANDS ---
# Terminal 1 — repo root
docker-compose up -d

# Terminal 2 — backend
cd backend/Booker.API
dotnet run

# Terminal 3 — frontend
cd frontend
npm run dev

--- PART 1: Fix page transition double-load ---

The page animates in while data is still loading, causing a double visual update.
Fix: use useSuspenseQuery for main data hooks + Suspense boundary in PageTransition.

1. In PageTransition.tsx, wrap children in <Suspense fallback={null}>
2. Change these hooks from useQuery → useSuspenseQuery:
   - useNextMeeting (useUser.ts)
   - useMyClubs, usePublicClubs, useClub, useClubMembers, useClubMeetings (useClubs.ts)
3. Remove isLoading guards from pages — with useSuspenseQuery the component
   never renders in a loading state, it suspends instead
4. Keep useCurrentUser as useQuery (has special sync fallback logic that doesn't
   work with useSuspenseQuery)

--- PART 2: Reading status feature ---

Each club member can mark "Got the book?" and "Started reading?" for the upcoming meeting.
The home card shows a bubble: "X/Y started · Z/Y got it"

Backend:
1. New entity: MeetingReadingStatus
   (Id, MeetingId, UserId, GotBook bool, StartedReading bool, UpdatedAt)
   - Composite unique index: (MeetingId, UserId)
   - Cascade delete on Meeting and User

2. Migration: AddMeetingReadingStatus

3. New endpoints on MeetingController:
   PATCH /api/club/{clubId}/meeting/{meetingId}/reading-status
     - Body: { gotBook: bool, startedReading: bool }
     - Upserts the current user's status for that meeting
     - [auth, members only]
   GET /api/club/{clubId}/meeting/{meetingId}/reading-status
     - Returns aggregate counts + current user's own status
     - { totalMembers, gotBook: count, startedReading: count, myStatus: { gotBook, startedReading } }
     - [auth, members only]

4. Update GET /api/user/next-meeting to include reading status summary:
   - Add readingStatus: { totalMembers, gotBook, startedReading, myGotBook, myStartedReading }

5. IMeetingReadingStatusRepository + MeetingReadingStatusRepository
   IMeetingReadingStatusService + MeetingReadingStatusService
   Register both in Program.cs

Frontend:
6. Add types in src/types/index.ts:
   ReadingStatus { totalMembers, gotBook, startedReading, myGotBook, myStartedReading }
   Update NextMeeting type to include readingStatus

7. ReadingStatusBubble.tsx (src/components/clubs/ReadingStatusBubble.tsx):
   - Floated to the right of the home meeting card
   - Two toggle rows: "Got the book?" (checkmark) + "Started reading?" (checkmark)
   - Below toggles: "X/Y started" count in small text
   - Tapping a toggle calls PATCH reading-status, invalidates next-meeting query
   - Visual: rounded pill/card, stone-50 bg, subtle border

8. Wire into Home.tsx:
   - Render ReadingStatusBubble alongside the meeting card
   - Only show if meeting has a book attached

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
Currently /books route exists but is unreachable from nav.
- List of all books read (past meetings with books) across all user's clubs
- Cover grid or list view
- Tap to see which club read it, when, ratings

--- FUTURE FEATURE: Theme Suggestion Box ---
Members can anonymously suggest themes for the next book pick (e.g. "something gothic", "set in Japan").

- Suggestions table: (id, club_id, content, created_at) — no user_id, anonymous by design
- Backend:
  POST /api/club/{id}/suggestion     — submit a theme suggestion
  GET  /api/club/{id}/suggestion     — list suggestions (admin/members only)
  DELETE /api/suggestion/{id}        — admin moderation
- Frontend: simple text input + list in club dashboard, shown before voting opens

--- FUTURE FEATURE: Local Bookstore Stock ---
When a book is being viewed or added to a meeting, surface nearby independent
bookstore availability so members can buy local instead of Amazon.

- Use Bookshop.org affiliate API or IndieBound store locator (both support ISBN lookup)
- Ask for user's location once (browser geolocation or manual postcode) — store on User record
- Backend: GET /api/book/{id}/stock?postcode={postcode}
- Frontend: "Find in a local store" button on meeting card

--- FUTURE FEATURE: PWA / Mobile ---
- Safe area insets (padding for notch/home bar)
- manifest.json + service worker
- Add to home screen prompt

--- NOTES ---
- useSuspenseQuery requires React Query v5 (already installed)
- Reading status endpoint is members-only (not owner-only) — all members can check off
- Composite unique index on (MeetingId, UserId) means PATCH is always an upsert
- Redis still unused — good candidate for caching reading status counts later
