# Home page implementation contract

Reference image: `/workspace/scratch/ec28a5a4055c/upload/2d5fa1f3-1a1c-4599-bcdd-9e4a0cffafe5.png`.

## Desktop geometry

- Full viewport, no vertical scrolling.
- Four vertical guides align to 12.5%, 37.5%, 62.5% and 87.5% of the 1348 px content shell at the measured 1363 × 936 browser viewport.
- Globe center: approximately 32% horizontal, 52% vertical; diameter approximately 58% of viewport height.
- Hero copy: x 52.19%, y 41.23%, width 420 px.
- Constellation: 177 × 145 px, top 15.1%, right 14.7%.
- Work link: centered at x 32.2%, y 79.7%, 258 × 60 px.

## Rendering and interaction

- The globe uses WebGL sphere geometry and procedural fragment shading; no screenshot crop or original identity asset is used.
- Axial rotation is time-driven. Mouse movement eases into yaw, pitch and positional parallax.
- City lights are limited to the dark hemisphere and populated latitude band.
- Reduced-motion users receive effectively static transitions while retaining the visual result.
- Menu and work controls remain keyboard reachable with native semantic elements.

## Responsive behavior

Below 992 px, the globe moves to the upper center and scales to 44% of viewport height, title copy moves below it, constellation is removed, and the work control remains centered. Footer chrome is simplified to prevent collisions.
