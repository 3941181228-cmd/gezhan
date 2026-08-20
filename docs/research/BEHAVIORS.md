# Observed behaviors

- Home globe: continuously rotates at a restrained speed; pointer position subtly alters globe yaw, pitch and position. The background stars move at a smaller parallax depth.
- Globe rendering: the surface is generated in the browser from sphere geometry and shaders, so the Earth remains sharp without copying the reference image. A procedural continent mask, city-light field and rim lighting reproduce the reference mood.
- Home entry: backlight, globe, orbit rings, title and constellation reveal in a staggered sequence.
- Home constellation: star cores pulse independently while the connector paths remain faint and stable.
- Page reveal: star field and grid fade/settle first; heading lines, form rules and body rows reveal with staggered blur-to-sharp motion.
- Star field: fixed to the viewport, sparse and low contrast. The rebuild adds subtle pointer parallax while preserving the observed density.
- Guide markers: a narrow bright segment travels independently along each of four guide lines with long irregular durations.
- Menu trigger: three thin bars become a close mark; the long center strike extends on hover and while open.
- Full-screen menu: vertical clip reveal over roughly 420 ms; artwork and navigation follow with a short stagger. Main page content becomes noninteractive.
- Link hover: navigation and footer links draw a thin horizontal rule.
- Scroll indicator: fixed right rail, live two-digit progress, thumb height proportional to viewport/document ratio.
- Footer chrome: hidden at the top of the contact page and revealed near scroll completion.
- Form: all fields remain keyboard accessible; focus preserves the precise line system. The demo submit is local-only and reports status without sending contact data.
- Reduced motion: reveal, glitch and traveling markers collapse to near-instant transitions.
