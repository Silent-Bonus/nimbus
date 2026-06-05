# Auth Session Logout

This document describes the current auth-session behavior in Nimbus:

- Automatic logout after inactivity
- A developer-only 15-minute test mode
- A manual reset flow that clears local auth state and cached user data

## Behavior Summary

The app keeps track of the last authenticated activity timestamp and checks it against a timeout window.

- Default timeout: `15 days`
- Test timeout: `15 minutes`

If the session has been inactive longer than the active timeout, the app clears local auth state and returns the user to the public landing screen.

## What Counts As Activity

The session timestamp is refreshed when:

- A user logs in successfully
- An authenticated API request is made
- The app becomes active again and the session is re-checked

This means the inactivity timer is based on real usage, not just app launches.

## Where The Check Runs

The session expiry check is enforced in a few places:

- App bootstrap in [`app/index.tsx`](/Users/urvi/sva-workspace/nimbus/app/index.tsx)
- Auth context startup in [`contexts/AuthContext.tsx`](/Users/urvi/sva-workspace/nimbus/contexts/AuthContext.tsx)
- A repeating foreground timer while the user is authenticated
- Axios request/response interceptors for authenticated API traffic

If the token is expired or the last-active timestamp is outside the timeout window, the session is cleared immediately.

## What Gets Cleared

On logout or reset, the app removes:

- Access token
- Refresh token
- Onboarding completion flag
- Last active timestamp
- Cached user profile
- In-memory `Authorization` header on Axios

The reset path returns the user to the public landing route.

## Manual Logout Flow

The normal logout action in Settings still calls the backend logout endpoint when possible.

- The remote logout is best-effort
- Local cleanup always runs
- If the server call fails, the app still clears the local session

## Developer Test Mode

A developer-only auth test toggle is available in the Settings screen.

- When disabled, the default `15 day` timeout is used
- When enabled, the timeout becomes `15 minutes`
- The toggle is stored locally so the test mode survives app reloads

This is intended for manual verification of the auto-logout flow during development.

## Manual Reset Flow

The Settings screen also exposes a manual `Reset auth session` action in developer mode.

That action calls the app reset flow directly and clears the same auth data listed above.

Use this when you want to verify:

- token removal
- local cache cleanup
- redirect back to landing

## Relevant Files

- [`services/authSessionService.ts`](/Users/urvi/sva-workspace/nimbus/services/authSessionService.ts)
- [`contexts/AuthContext.tsx`](/Users/urvi/sva-workspace/nimbus/contexts/AuthContext.tsx)
- [`app/index.tsx`](/Users/urvi/sva-workspace/nimbus/app/index.tsx)
- [`app/(auth)/(tabs)/settings.tsx`](/Users/urvi/sva-workspace/nimbus/app/(auth)/(tabs)/settings.tsx)
- [`constants/Constant.ts`](/Users/urvi/sva-workspace/nimbus/constants/Constant.ts)

## Notes

- The test switch is shown only in development builds.
- The refresh token is still stored because the manual logout endpoint may use it, but there is no separate refresh-token renewal loop in the client.
- If you want to verify expiry quickly, enable auth test mode and wait 15 minutes without authenticated activity.
