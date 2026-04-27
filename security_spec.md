# Security Spec: ZedMusic Heritage

## Data Invariants
1. A `Song` must have an `artistId` that points to a valid `Artist` document (enforced via application logic and `exists`).
2. Only `admin` or authorized `manager`/`curator` roles can create or update `Song` and `Artist` documents.
3. `UserProfile` roles can only be updated by an `admin`.
4. Users can only read their own `CurationApp` until it is processed by an `admin`.
5. Public can read `Song`, `Artist`, and `EducationalContent` but cannot write.

## The Dirty Dozen Payloads (Targeting Rejection)

1. **Identity Spoofing**: Attempt to create a song as another user.
2. **Privilege Escalation**: Attempt to update own role to 'admin' in `UserProfile`.
3. **Ghost Field Injection**: Add `isApproved: true` to a song document.
4. **Invalid Type**: Set `genre` to `techno` (not in enum).
5. **Missing Required Fields**: Create song without `mediaUrl`.
6. **Resource Poisoning**: Create an artist with a 2MB `bio` string.
7. **Orphaned Write**: Create a song with a non-existent `artistId`.
8. **Temporal Integrity**: Create a song with a `createdAt` in the future (compared to `request.time`).
9. **Role Bypass**: A standard user attempting to delete a song.
10. **State Shortcutting**: Updating a `CurationApp` status directly to `approved` without admin verification.
11. **PII Leak**: Attempting to read another user's `UserProfile` as a guest (if private).
12. **Bulk Scrape**: Attempting a list query on `applications` without being an admin.

## The Test Runner (Mock Logic)
Verification is handled via ESLint and manual logic check against the 8 pillars.
