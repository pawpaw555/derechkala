---
name: probe-fitness
description: Before treating any tool output as a finding, confirm the tool answers the question being asked and that its output is complete. Use whenever a check returns "not found", "zero", "unavailable", or a count — especially in Search Console, browser automation, sitemaps and index diagnostics. Built from three real failures in one session where a correct-looking answer came from a tool that was never designed to answer that question.
---

# Probe fitness

The existing rule says: *never report an absence from a single probe — run a control
first.* That rule assumes the probe is the right instrument and only its sensitivity
is in doubt.

This skill covers the failure one level earlier: **the instrument was wrong for the
question, and it still returned a confident-looking answer.**

A control run alone does not catch this. A control on the wrong instrument passes
just as convincingly.

## The two questions, in order

Before any tool output becomes a claim:

1. **Fitness** — is this tool designed to answer this question, for this kind of
   object? If not, its output is noise no matter how definite it reads.
2. **Completeness** — did it return everything, or a subset shaped by the tool's
   own limits (viewport, pagination, row cap, default filter, permission)?

Only after both pass does the control-term rule from `wordpress-seo-ops` apply.

## The tell

**The most dangerous output is a definite negative from a tool that had nothing to
say.** Tools rarely answer "that question does not apply here". They answer
"not found", "unavailable", "0" — which is indistinguishable from a real finding.

A real absence and an inapplicable question produce the same string.

## Failure log — one session, three instances

### 1. Wrong instrument for the object

URL Inspection was run on `https://derechkala.online/sitemap-0.xml` to find out why
Google was not processing it.

Returned: "URL is not on Google", "No referring sitemaps detected", "Last crawl:
unavailable".

Read as: Google never fetched the sitemap. **Wrong.**

URL Inspection reports *page indexing*. A sitemap file is never indexed as a page,
and is never listed as a `<url>` inside another sitemap — it appears as a
`<sitemap>` entry in a sitemap index, which is a different field. Every single one
of those answers is what a perfectly healthy sitemap returns.

The tool had no opinion. It was read as having a strong one.

> **Rule:** name the object type before choosing the tool. Page, sitemap, redirect,
> API endpoint, image, feed — they are not interchangeable, and the same tool means
> different things for each.

### 2. Silent truncation by viewport

`read_page` on `/line-red` returned 5 station links. The page has 34.

Nearly reported as "the page lazy-loads its station list, so Google may not see it" —
which would have sent the whole diagnosis down a false path.

The accessibility-tree reader returns what is currently rendered in the viewport.
Scrolling changed the answer. The page was never at fault.

> **Rule:** any count from a rendering-aware tool is a count *of what was rendered*.
> For "does this exist in the HTML", fetch the raw source and count there —
> `fetch(url, {credentials:'omit'})` — never the DOM reader.

Correct method used afterward:

```js
const raw = await fetch(url, {credentials:'omit'}).then(r=>r.text());
const hits = raw.match(/href="\/station\/[^"]*"/g) || [];
({
  count: hits.length,
  unique: new Set(hits).size,
  control: (raw.match(/href="\/map"/g)||[]).length  // known-present
})
```

### 3. A field that errors instead of reporting

The URL Inspection "Discovery → Sitemaps" field returned
"temporary processing error" on `/map` — a page known to be indexed and crawled.

That field was the entire basis for a conclusion about a different URL. A field that
errors on a known-good object cannot support a claim about an unknown one.

> **Rule:** run the control on the **specific field** being used, not on the tool as
> a whole. A tool can be right and one of its fields still be dead.

## Checklist

Run before reporting any tool output as a finding:

- [ ] What is the object type, and is this tool built for that type?
- [ ] Would a healthy object return this same output? If yes, the output is worthless.
- [ ] Could the result be truncated — viewport, pagination, row cap, default filter?
- [ ] Did I run a control on the exact field I am relying on?
- [ ] Is there a second, independent instrument that should agree? Did it?
- [ ] Am I reading "unavailable" as "absent"? They are different claims.

## Reporting format

State the instrument alongside the number, and state its known limits.

> Observed: 34 station links in the raw server HTML of `/line-red`
> (fetched with credentials omitted; control `href="/map"` found twice, so the
> match pattern works).
> Not used: the DOM reader — it returned 5, limited to the viewport.
> Inferred: nothing. Internal linking is not the cause.

An output whose instrument is unnamed is not evidence yet.

## Where this sits

| Stage | Skill |
|---|---|
| Before choosing a target or diagnosing | `seo-decision-gate` |
| **Before trusting any single tool output** | **this skill** |
| Before reporting an absence | `wordpress-seo-ops`, rule 1 |
| Before/after writing to a live site | `wordpress-seo-ops`, working protocol |
