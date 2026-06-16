# דער שטעלע — design system conventions

A small, conservative **RTL / Hebrew** UI kit for a Haredi-audience job-placement
site. Three components ship: **Button, Card, Input**. Import from
`@der-shtele/frontend` (bound to `window.DerShtele`).

## Setup — no provider needed
Components are self-contained: `import { Button } from '@der-shtele/frontend'` and
render them. There is **no theme/context wrapper**. The shipped `styles.css`
already sets the page **RTL** (`html { direction: rtl }`) and the **Heebo** font, so
every design is right-to-left and Hebrew by default — don't add your own `dir` or
font; build RTL layouts.

## Brand & cultural rules (required for on-brand output)
- **Hebrew, RTL** copy and layout throughout. Phrasing is respectful and direct
  (second person); use double-gender forms where natural (מועמד/ת, דרוש/ה).
- **No images of people** anywhere — no photos, avatars, or hero portraits.
- Modest and conservative: calm spacing, the blue/neutral palette below, no flashy
  animation, no ads.

## Styling idiom — Tailwind utilities on a STATIC stylesheet
The DS styles with Tailwind classes, but the shipped `styles.css` / `_ds_bundle.css`
is a **pre-compiled static build** — there is no JIT at render time, so **only
utility classes already present in `_ds_bundle.css` actually render**. Therefore:

1. **Compose the components first** — they carry their own styling. Pass props
   (`variant`, `label`, `error`) and `className`; don't hand-roll styled markup.
2. For layout glue, use utilities known to be present (below). For anything not
   listed, prefer an **inline `style`** (always renders) over a Tailwind class that
   may be absent.

**Brand tokens (theme):**

| Use | Classes |
|---|---|
| Brand blue | `bg-primary-600` `hover:bg-primary-700` `text-primary-600` `border-primary-600` `bg-primary-50` `hover:bg-primary-50` |
| Neutrals | `bg-neutral-50` (page) · `text-neutral-800` (body) · `text-neutral-700` · `border-neutral-200` |
| Font | Heebo (default sans) |
| Radius / elevation | `rounded-xl` `rounded-2xl` `shadow-sm` |

**Layout utilities present** (prefer these): `flex` `flex-col` `flex-wrap`
`inline-flex` `items-center` `items-start` `justify-center` `justify-between` `grid`
`grid-cols-1` `gap-1`–`gap-8` `w-full` `max-w-sm` `max-w-md` `mt-/mb-1`–`8`
`p-/px-/py-` (steps 2,3,4,6,8) `space-y-1`–`6` · text sizes `text-xs` `text-sm`
`text-lg` `text-xl` `text-2xl` `text-3xl`.

## Components
- **Button** — `variant?: 'primary' | 'outline'` (default `primary`) plus any
  `<button>` attribute + `className`. Primary = filled blue CTA; outline = bordered
  secondary action.
- **Card** — white rounded container (border + shadow + padding); place any content
  inside. The app's main pattern is a job card: role, a `משרה מלאה · עיר` meta line,
  a short description, then action buttons. **Never expose a company name** — company
  details stay hidden until the team approves.
- **Input** — `label` (rendered above), `error` (red message + red border below),
  plus any `<input>` attribute. Always pass a matching `id` so the label associates.

## Where the truth lives
Read `styles.css` (→ `_ds_bundle.css`) for the exact set of available classes, and
each `components/general/<Name>/<Name>.prompt.md` + `<Name>.d.ts` for the API.

## Example
```tsx
import { Button, Card, Input } from '@der-shtele/frontend';

export function ApplyCard() {
  return (
    <Card className="max-w-md">
      <h3>מנהל/ת חשבונות</h3>
      <p className="mt-1 text-sm text-neutral-700">משרה מלאה · בני ברק</p>
      <div className="mt-4 flex flex-col gap-4">
        <Input label="שם מלא" id="name" placeholder="ישראל ישראלי" />
        <Input label="דוא״ל" id="email" type="email" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">שליחת מועמדות</Button>
        <Button variant="outline">שמירת משרה</Button>
      </div>
    </Card>
  );
}
```
