# Technical and Product Architecture Decisions (DECISIONS.md)

This log records every architecture and design decision made during the development of Borrow Before Buy (BBB), ensuring full transparency, adherence to product rules, and no hidden assumptions.

---

## 1. Zero Money Flow Invariant
- **Decision**: BBB strictly eliminates all digital money processing, payment gateways, wallets, UPI integrations, and in-app balances.
- **Rationale**: Keeps the application 100% legal, compliance-free, and focused purely on peer-to-peer trust and student collaboration.
- **Implementation**: The only monetary field stored is an integer offline security amount agreed upon by both students. Every screen displaying this amount renders an explicit, non-dismissible notice: *"BBB never handles money. This amount is settled directly between the two of you."*

## 2. Authoritative Single Transaction State Engine
- **Decision**: All transaction lifecycle state transitions are centralized into a single backend function: `transitionTransaction(transactionId, action, actor, payload)`.
- **Rationale**: Prevents race conditions, avoids distributed state mutations, and enforces database-level row locking (`SELECT ... FOR UPDATE`).
- **Implementation**: The function validates caller permissions, checks the allowed-transition map, evaluates role guards (e.g. before-photos, QR tokens, return inspection), increments the transaction version, emits transaction events, triggers trust calculations, and dispatches notifications.

## 3. Dynamic Single-Use QR Handover Tokens
- **Decision**: QR tokens are signed JSON Web Tokens (JWT) with HS256 containing transaction ID, jti, and a short 5-minute expiry. Only the cryptographic hash of the `jti` is stored in the database.
- **Rationale**: Prevents QR screenshot re-use, replay attacks, and offline tampering.
- **Implementation**: When the borrower scans the QR code or types the 6-digit manual fallback code, the backend verifies the signature, verifies the caller is the borrower, and runs an atomic `UPDATE handover_tokens SET used_at = NOW() WHERE jti_hash = $1 AND used_at IS NULL` before transitioning the state to `BORROWED`.

## 4. Derived Trust & Reputation Scores
- **Decision**: User trust scores for Borrower and Lender roles (0–100, default 50) are strictly derived from an immutable append-only `trust_events` table and are never directly edited.
- **Rationale**: Guarantees auditability and prevents arbitrary score inflation.
- **Implementation**: Pre-configured positive/negative point deltas are recorded with transaction references and aggregated on demand or cached with event invalidation.

## 5. Dual-Driver Storage Abstraction
- **Decision**: Storage interface supporting `local` (filesystem) for development and `s3` (S3/Cloudflare R2) for production.
- **Rationale**: Simplifies local development without external cloud dependencies while remaining production-ready.
- **Implementation**: Item photos are served via public URLs, while condition and dispute evidence photos are stored in private paths and served exclusively through authenticated, access-controlled streaming endpoints.

## 6. Token Security & Session Management
- **Decision**: Auth tokens are stored exclusively in `httpOnly`, `SameSite=Lax` cookies with `X-Requested-With: bbb` custom CSRF header validation on state-changing requests. Never stored in `localStorage` or `sessionStorage`.
- **Rationale**: Protects students from Cross-Site Scripting (XSS) and token theft.
