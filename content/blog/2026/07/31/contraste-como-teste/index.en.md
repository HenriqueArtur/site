---
title: Contrast as a test, not as an inspection
description: Accessibility that depends on someone remembering to check is not a guarantee. How I turned this site's palette into something the build verifies.
date: 2026-07-31
tags: [accessibility, design, testing]
draft: false
---

Almost every team I know treats colour contrast as a review step: someone opens a tool,
pastes two hex values, confirms it passes AA, and moves on. That works right up until the
first time someone nudges a shade "just a little" six months later.

The problem is not carelessness. It is that the check lives outside the code, so nothing
runs it again when the code changes.

## What I did here

This site's palette lives in a TypeScript module, not in a CSS file:

```ts
export const tokens = {
  color: {
    paper: '#F7F4ED',
    ink: '#2A241C',
    accent: '#E2571E',
    accentDeep: '#A93C10',
    // ...
  },
};
```

The CSS custom properties are **generated** from that object. That alone removes a whole
class of bugs — there is no second copy of the palette to drift out of sync.

But the real win is that this becomes possible:

```ts
describe('text contrast against backgrounds', () => {
  it('ink on paper reaches 4.5:1', () => {
    expect(contrastRatio(color.ink, color.paper)).toBeGreaterThanOrEqual(4.5);
  });
});
```

Changing a colour and breaking accessibility now fails the build.

## Two things that only surfaced because they were tested

First: the token I used for the grid lines **failed** 3:1. That is correct — it is
decoration and carries no information. But it revealed that I had no token at all for
borders that *delimit* content, which do have to pass. A second token was born, and the
distinction between "decorative line" and "line that means something" became explicit in
the design system instead of living in my head.

The second is my favourite test in the project:

```ts
it('accent does NOT reach 4.5:1, which is why accentDeep exists', () => {
  expect(contrastRatio(color.accent, color.paper)).toBeLessThan(4.5);
});
```

It asserts a limitation. The bright orange does not work as text — only as border and icon
— and that is precisely why a darker orange exists beside it. If someone ever lightens the
background enough for the first one to pass 4.5, the test fails and says the pair has
become redundant.

A test that documents *why* a decision exists is worth more than a comment, because a
comment never tells you when it stopped being true.

## The pattern

This is not about colour. It is about where the guarantee lives.

Every rule you verify by hand is a rule that will be violated — not through negligence, but
because the person violating it did not know it existed. If a rule can be written as code,
it should be: not to automate the work, but so the next person discovers the rule through
the failure, the second they break it, rather than months later in a report.
