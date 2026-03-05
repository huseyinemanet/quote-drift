# App Store Submission Checklist

- Quote Drift launches into a real loading/import screen, not a blank screen.
- The bundled quote corpus validates on boot or shows the fatal-data recovery screen.
- Today, Library, favourites, feedback, and About work fully with notifications disabled or denied.
- Support URL and Privacy Policy URL open correctly from Settings > About.
- No placeholder routes, dead-end flows, or broken outbound links remain.
- Exhausted-state recovery works:
  - restart collection
  - keep notifications off
- Local reminders stay inside configured active hours.
- Test notification uses fixed copy and does not consume a quote.
- iOS and Android simulator smoke tests pass before submission.
