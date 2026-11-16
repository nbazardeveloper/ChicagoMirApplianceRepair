# Chicago copy — what still needs real Chicago data

This site was copied from the Charlotte project. City names, neighborhoods and
IL/Illinois are already replaced; everything business-specific was blanked out
so nothing points at the Charlotte business by accident.

| What | Where | Status |
|---|---|---|
| Domain (`subzerovikingchicago.com` is a guess) | `src/lib/seo.ts`, `public/robots.txt`, `wrangler.jsonc` name | replace with the real domain |
| Phone `+1 (000) 000-0000` | `src/lib/site-data.ts`, `src/routes/__root.tsx` (JSON-LD), LP fallbacks | put the real Chicago number |
| Email `info@subzerovikingchicago.com` | `src/lib/site-data.ts`, `src/routes/__root.tsx` | placeholder |
| Booking URL (currently `/contact`) | `BOOKING_URL` in `src/lib/site-data.ts` | Chicago booking page / widget |
| Google Ads tag + phone-click conversion | `src/routes/__root.tsx` (removed) | add Chicago tag |
| Thank-you conversion `AW-XXXXXXXXXX/…` | `src/routes/thank-you.tsx` | add Chicago conversion |
| Chat widget (GoHighLevel) | removed from `__root.tsx` | add Chicago widget if wanted |
| Google Business Profile link | `GOOGLE_PROFILE_URL` in `src/lib/site-data.ts` | Google cards stay hidden while empty |
| Google rating / review count | `siteSettings` in `src/lib/site-data.ts` | stars appear automatically |
| Completed-jobs map | `WORK_MAP_ID` in `src/lib/site-data.ts` | map sections stay hidden while empty |
| Patch badge | removed from footer and landing pages | add Chicago listing if any |
| Project photos in `public/images/projects` | gallery and landing pages | these are Charlotte jobs — swap for Chicago work |
| Blog posts `src/lib/blog-data.ts` | auto-replaced city/neighborhood names | read through; wording around areas may be awkward |
| Hours, $95 diagnostic fee, warranty, brands, "13+ years" | site-wide | verify they apply to Chicago |
