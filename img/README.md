# Assets

## Resume

The contact section's "Download resume" button links to:

    img/denise-barrett-resume.pdf

**Not yet added.** The original `Resume.pdf` contains a phone number that
is extractable as text, not just visible — covering it up in a PDF editor
does not remove it. Export a version without the phone number from the
source design file, save it here under that exact filename, and the
button works.

Also worth updating while you are in there: the resume says "8+ years"
and lists 2017-present, while the site and deck say 12 years.

## Case study images

The three case studies use inline SVG system diagrams rather than
screenshots. To add real screenshots, drop them here and replace the
`<div class="band">` block on the relevant `case-*.html` page with:

    <img src="img/your-screenshot.png" alt="..." />
