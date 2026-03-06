# QA Checklist

## Core Product
- Daily quote loads offline.
- Library search works offline.
- Save/unsave works.
- Share image flow works.
- No repeats occur before exhaustion across Today and scheduled notifications.

## Rewarded One More
- Today shows `One more` when no extra quote has been unlocked.
- Tapping `One more` opens the modal.
- `Not now` closes the modal immediately.
- Rewarded completion grants exactly one extra quote.
- Skip/close/error/unavailable ad grants nothing and shows a friendly message when appropriate.
- After unlock, `One more` is no longer available for that day.

## Sticky Banner
- Banner appears above the tab bar on Today, Library, and Settings.
- There is visible spacing between the banner and tab bar.
- Content is never hidden behind the banner or tab bar.
- Failed banner loads leave no empty gap.
- Closing the banner hides it for 24 hours and removes the gap immediately.

## Notifications
- App works with notifications denied.
- Optional reminder scheduling respects active hours.
- Test notification does not consume a quote.

## Submission Safety
- Privacy Policy and Support links open correctly.
- The app remains usable with ads failing and with notifications disabled.
