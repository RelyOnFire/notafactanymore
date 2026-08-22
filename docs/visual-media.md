# Visual media system

Visuals on Not a Fact Anymore are evidence or explanation, not decoration.

## Content rules

- Add a visual only when it helps a reader understand the old model, the corrective evidence, or the mechanism of change.
- Prefer primary or institutional source material for historical maps, photographs, scans, and scientific figures.
- Do not use generic stock imagery.
- Every media item requires descriptive alt text, an explanatory caption, creator/credit information, a source link, and a rights classification.
- English and German cards use the same media IDs. Alt text and captions are localized independently.
- The permanent media checker rejects EN/DE media-ID drift.

## Placement

Visuals currently appear only on full entry pages, between the expanded fact card and the narrative context. They do not appear in Browse, Timeline, category cards, or homepage cards.

`layout: wide` breaks the figure beyond the normal text column while staying inside the viewport. `layout: inline` stays inside the normal entry width.

## English entry media fields

- `id`
- `type`
- `src`
- `width`
- `height`
- `alt`
- `caption`
- `credit`
- `sourceLabel`
- `sourceUrl`
- `rights`
- `layout`

## German media translation fields

- `id`
- `alt`
- `caption`

## Rights values

- `public-domain`
- `public-domain-no-known-restrictions`
- `source-specific`

## First prototype

`california-is-an-island` uses Joan Vinckeboons's circa-1650 manuscript map from the Library of Congress. It is a strong prototype because the image is itself evidence of the discarded model, rather than decoration added after the fact.
