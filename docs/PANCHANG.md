# Panchang & Muhurat engine

`packages/panchang` is a **deterministic** astronomy engine: for the same (date, city, ayanamsa) it returns the same answer, always, with no network call and no ephemeris file to drift. That property is what lets us cache it aggressively, snapshot it onto an event, and stand behind a printed invitation.

## Inputs and outputs

```ts
computePanchang(year, month, day, { city, latitude, longitude, tzOffsetHours }, ayanamsa)
→ {
    date, weekday, weekdayName,
    tithi:    { index, name, paksha, endsAt, isPurnima, isAmavasya },
    nakshatra:{ index, name, pada, endsAt },
    yoga, karana,
    masa, shakaYear, vikramSamvat,
    sunrise, sunset, dayLength, solarNoon,
    abhijitMuhurat, brahmaMuhurat, vijayaMuhurat, godhuliMuhurat,
    rahuKaal, yamaganda, gulikaKaal,
    choghadiyaDay[], choghadiyaNight[],
    sunRashi, moonRashi, ayanamsa,
    method: { ephemeris, ayanamsa, accuracyNote }
  }
```

`tzOffsetHours` is passed explicitly (5.5 for India) rather than read from the host: a server in another region must not change a muhurat. All internal astronomy is done in UTC/Julian days and formatted to IST at the end.

## Verified against published panchangs

| Check | Engine | Reference |
| --- | --- | --- |
| Pune sunrise, 2026-09-24 | 06:23 | published Pune sunrise 06:23 |
| Pune solar noon | 12:26 | consistent with sunrise/sunset |
| Pune sunset | 18:29 | published sunset 18:29 |
| Lahiri ayanamsa, 2026 | ≈ 24.1–24.25° | standard Lahiri values |
| अमावास्या end, 2026-11-09 | दुपारी १२:३५ | Drik Panchang 12:31 IST (≈4 min) |
| Gudi Padwa (चैत्र शुक्ल प्रतिपदा) 2026-03-19 | starts ~06:54 | published 06:52 IST |
| राहुकाळ, Pune | सकाळी ९:५८ – ११:२२ | the Monday 4th-of-8 segment of the day |

The engine deliberately does **not** claim sub-minute precision. `method.accuracyNote` says so on the page, and the UI repeats it: this is a computational aid, the family's guru decides.

## Muhurat suitability — scoring, never a verdict

`evaluateMuhurat({eventType, date, location})` returns a score (0–100, **ceiling 98** — no date is ever advertised as perfect) plus every factor that moved it:

```
factors: [{ id, label, delta, impact: 'positive'|'negative'|'neutral', detail }]
recommendedWindows[]   // अमृत, लाभ, शुभ, अभिजित — the day's usable windows
avoidWindows[]         // राहुकाळ, यमगंड, गुलिक काळ
band                   // उत्तम / चांगली / मध्यम / मर्यादित अनुकूलता
methodology            // named method per event type, e.g. 'विवाह मुहूर्त (सौर सिद्धांत)'
```

Factors include the tithi (with पौर्णिमा scored **differently per event type** — श्रेष्ठ for सत्यनारायण पूजा, वर्ज्य for विवाह and samskaras), the nakshatra suitability for that ceremony, the weekday, the yoga/karana, whether the day falls in राहुकाळ, and the presence of अभिजित. Every delta is printed next to its reason:

> ＋१५ नक्षत्र — अनुराधा · ＋१० तिथी (दशमी) · −४ राहुकाळ सकाळी ७:५६ – ९:२४ · ＋६ अभिजित मुहूर्त सकाळी ११:५६ – दुपारी १२:४२

`findMuhurats({eventType, location, from, to, limit, minScore})` scans a window and returns the best days **with their windows**, which is what the event wizard and `/panchang` use to answer "which Saturdays work for a wedding this winter?".

### The cultural rule we will not break

There is no `isGoodDay` boolean anywhere in the product, and no screen ever prints "शुभ दिवस" or "अशुभ दिवस". The vocabulary is **अनुकूलता** (suitability) with published method. The plan was explicit, and it is also the honest product: a family that is told a date is "bad" stops trusting the app; a family that is shown why a date scores 84 and which window is अमृत keeps planning.

Related: **guna-milan / kundali matching is private-only** — it exists as a private tool and is never surfaced as a public match score, and matrimony/spouse discovery is out of scope entirely (we start after the decision is made).

## City handling

`MAHARASHTRA_CITIES` carries latitude/longitude/tz for Pune, Pimpri-Chinchwad, Mumbai, Nashik, Nagpur, Kolhapur, Satara, Sangli, Thane, Aurangabad, Solapur and Amravati. Sunrise shifts up to ~20 minutes across the state, which moves tithi boundaries and therefore muhurats — so the city is always an explicit input, and the page prints the coordinates and ayanamsa it used. Marathi place names inflect (पुणे/पुण्यात), so city matching uses stems, not equality.

## Performance and caching

- One day's panchang: sub-millisecond warm.
- A **full-year muhurat scan** (`findMuhurats`, 365 days × evaluation): **1.8 ms warm**, 22–38 ms cold.
- `panchangFor()` in `apps/web/src/lib/panchang.ts` memoises per `(city, date)` — a wedding page with ten thousand guests computes the panchang once per process.
- Events store a **snapshot** (`events.panchang_snapshot`, `events.muhurat`) taken at the moment the date was chosen. Guests see the tithi the family chose by, permanently, even if the engine version changes. Recomputing history is not a feature.

## Where it appears

| Surface | Use |
| --- | --- |
| `/panchang` | month grid with daily suitability tint, choghadiya, 60-day muhurat finder, method panel |
| `/create` wizard | dates scored for the chosen event type; unsuitable dates are shown with reasons, not hidden |
| `/e/[slug]` | the snapshot: तिथी, नक्षत्र + पद, सूर्योदय, सूर्यास्त, अभिजित, राहुकाळ, and `.ics` download |
| `/studio/[slug]` | muhurat readiness (100 = the chosen date scores उत्तम) |
| `/api/panchang` | JSON for partners and the assistant |
| seed | event dates are **chosen by the engine** at seed time, so the demo wedding (2027-01-31) is genuinely कृष्ण दशमी / अनुराधा, उत्तम (98), अभिजित दुपारी १२:२५ – १:१० |
