# Manufacturer Profit Roadmaps

Five revenue-specific roadmaps are generated from the original manufacturer
content in `content-source/`.

## Render

```bash
node roadmap-src/render-manufacturer-roadmaps.mjs
```

The renderer writes the finished PDFs to `public/roadmaps/` using stable public
filenames:

- `profit-roadmap-under-1m.pdf`
- `profit-roadmap-1m-2m.pdf`
- `profit-roadmap-2m-5m.pdf`
- `profit-roadmap-5m-10m.pdf`
- `profit-roadmap-10m-plus.pdf`

Generated HTML and review images are written to `roadmap-src/generated/` and
are intentionally excluded from Git.

## Delivery rule

The landing page does not expose a download button. GoHighLevel delivers the
matching hosted PDF by email after form submission. Keep the filenames stable
so the email workflow does not need new URLs for future roadmap revisions.
