# Contact page implementation contract

## DOM and roles

- Decorative layers are `aria-hidden`.
- The menu trigger is a real button with `aria-expanded` and an adaptive label.
- The menu is a named navigation region; hidden links leave the tab order.
- Contact information uses mail and telephone links.
- The form uses labels, autocomplete hints, native input types, validation and a live status region.

## Desktop geometry

- Maximum shell width: 1440 px.
- Primary insets: 12.5%.
- Main columns: 220 px + `clamp(28px, 4vw, 72px)` + fluid content.
- Main top padding: 154 px; bottom padding: `clamp(200px, 26vh, 300px)`.
- Rail sticky offset: 120 px; maximum height: 700 px.
- Headline: 60 px maximum, 0.92 line-height, four lines.
- Form field grid: 112 px label + 36 px gap + fluid control.
- Standard field height: approximately 49 px; message row: 160 px.
- Submit control: 248 × 47 px.

## Responsive behavior

At 991 px and below, the page becomes a vertical flow with 18–24 px edge padding. The title rail becomes a horizontal three-column title/line/title lockup, field labels move above controls, the scroll rail is removed, and the button remains 248 px wide unless the viewport is narrower.
