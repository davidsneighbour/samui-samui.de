---
name: ss-research-news
description: Research recent Koh Samui, Thailand, and regionally relevant Asia news for samui-samui.de, Patrick's German-language personal blog about life in Thailand, and produce a structured editorial brief with relevance weighting, source assessment, and blog topic ideas.
---

<!-- markdownlint-disable title-case-style MD004 MD025 MD036 -->

# Samui Samui News Research

## Purpose

Research recent news, events, developments, and potential blog topics for
`samui-samui.de`, Patrick's German-language personal blog about life in
Thailand.

The skill is project-local. It is only for this repository and this website,
not a generic Thailand research assistant.

Koh Samui is the editorial centre. Thailand-wide stories are also in scope when
they matter for life, travel, politics, culture, public services, tourism,
German readers, or the long-running blog perspective. Wider Asian or regional
stories are in scope only when they plausibly affect Thailand, German visitors
or residents abroad, travel flows, public health, regional politics, culture, or
major topics that could become locally relevant.

It must:

* research a configurable recent period;
* search Thai-, English-, and German-language sources;
* include local news, Thailand-wide news, tourism, entertainment, events,
  government, business, travel, culture, people, royal coverage, lifestyle, and
  selected regional Asia sources;
* classify every story into one of the three editorial circles of interest;
* score or label editorial relevance with an A/B/C weighting;
* use a maintained project source list as an additive starting point;
* independently find additional relevant sources;
* identify duplicate reporting and original reporting;
* distinguish confirmed facts from announcements, promotional claims, rumours, and interpretation;
* produce a German-language research brief using the exact output structure defined below;
* generate concrete ideas for future blog posts rather than merely summarising news.

The source list is never exclusive. It is a curated starting point that supplements, but does not limit, wider research.

## Objective

Create a current, source-backed research brief for editorial planning on
`samui-samui.de`.

The report is research material, not a finished blog article.

The final report must be written in German.

## Default research period

When the user does not specify a research period, research the past 10 days:
yesterday plus the nine calendar days before yesterday. Do not include today by
default, because same-day news indexes, feeds, and international mirrors are
often incomplete or still moving.

The user may override the period.

When the user asks for "last week", interpret it as yesterday plus the seven
calendar days before yesterday. Do not include today, because same-day news
indexes, feeds, and international mirrors are often incomplete or still moving.

When the user asks for "this month", use the current calendar month as the
bracket: the first day of the current month through the last day of the current
month. If the month is still in progress, include only published material up to
the latest reliable available date and state that the month is incomplete.

When the user asks for "last month", use the full previous calendar month as the
bracket: the first day through the last day of that month.

Always state the exact start and end dates in the report.

Do not use vague date descriptions such as "recently" when an exact publication or event date is available.

For international news pages, be flexible about publication-date time zones.
Treat a story as in range when the source's local publication time, the
Thailand calendar date, or a reasonable neighbouring timezone conversion places
it inside the requested window. Note the ambiguity when it affects inclusion,
ordering, or follow-up checks.

## Editorial circles of interest

Every story must be assigned to one of these circles:

### Circle: Samui

Samui is the strongest circle and includes:

* Koh Samui, Ko Samui, เกาะสมุย, and Samui district;
* Koh Phangan, Koh Tao, Surat Thani, Nakhon Si Thammarat, and Gulf of Thailand
  transport routes when there is a practical Samui connection;
* ferries, airports, airlines, roads, utilities, weather, safety, environment,
  tourism policies, events, people, and local businesses affecting Samui.

### Circle: Thailand

Thailand-wide stories belong here when they are relevant to the blog, German
readers, residents, visitors, or life in Thailand. Examples include:

* national politics, law, visas, immigration, taxation, public services, health,
  safety, transportation, economy, culture, and environmental policy;
* tourism trends, route changes, airline/ferry/rail connections, travel rules,
  and visitor behaviour;
* monarchy and royal events when covered as public/cultural context;
* prominent people coming to Thailand, celebrity visits, film/TV/music, sport,
  festivals, exhibitions, nightlife, and entertainment;
* odd, contradictory, funny, revealing, or culturally useful Thailand stories
  that could fit Patrick's voice and archive.

### Circle: Asia and wider region

Regional stories outside Thailand belong here only when they have a plausible
Thailand or German-abroad relevance. Examples include:

* neighbouring-country tourism, transport, safety, weather, public-health, or
  political developments that may affect Thailand or travel flows;
* regional issues for Germans abroad, long-stay residents, retirees, families,
  travellers, consular life, or cross-border bureaucracy;
* major early signals that may become locally relevant, such as Covid-like
  public-health developments in late December 2019;
* Asian entertainment, film, culture, people, or events with a Thailand or
  German-reader connection.

Do not include generic world or technology news. Patrick's tech writing belongs
on `kollitsch.dev`, not `samui-samui.de`, unless a technology story has a clear
Thailand-life angle such as local public services, travel systems, censorship,
payments, privacy, scams, or infrastructure.

## Relevance weighting

Give every included story a relevance label:

* `A` — strong candidate for `samui-samui.de`; clear Samui/Thailand relevance,
  useful German-reader angle, or strong personal-blog potential.
* `B` — useful context or possible article; relevant but needs more local angle,
  confirmation, timing, or follow-up.
* `C` — watchlist/background; not an article yet, but worth noting because it
  may develop, repeats a pattern, or has regional/German-abroad relevance.

Do not hide weaker `C` items when they are useful signals. Mark them clearly so
they do not compete with stronger Samui or Thailand topics.

## Languages

Research sources in:

1. Thai
2. English
3. German

Use Thai-language search terms as well as translated English and German variants.

Important Thai search terms may include:

- เกาะสมุย
- สมุย
- ข่าวเกาะสมุย
- ท่องเที่ยวสมุย
- สนามบินสมุย
- เทศบาลนครเกาะสมุย
- สุราษฎร์ธานี สมุย
- เหตุการณ์สมุย
- งานสมุย
- อุบัติเหตุสมุย
- สิ่งแวดล้อมสมุย

Search terms must be adapted to the reporting period and emerging stories.

## Source entry points

Sources are not limited to website homepages. A maintained source entry may point to the most useful public entry point for recurring research, including:

* RSS or Atom feeds;
* category, section, topic, or tag pages;
* stable internal search-result pages;
* official announcement or press-release archives;
* public event calendars;
* public social-media profiles;
* newsletter archives.

Prefer the narrowest reliable entry point that consistently surfaces material
for the relevant circle: Samui, Thailand, or Asia/Region.

A specialised page or feed is an entry point, not automatically the original source. Open and evaluate the linked article, announcement, event page, or document before citing it.

For every maintained entry point, record:

* its source type;
* the parent publication or organisation;
* the geographical and thematic scope;
* whether results are chronological;
* whether the URL and query parameters appear stable;
* whether it exposes full text, summaries, or links only;
* known duplication, pagination, or update-frequency issues.

Do not rely exclusively on RSS feeds or internal search pages. They may omit articles, delay publication, truncate content, reorder results, or stop working without notice. Supplement them with independent web searches and direct checks of important source sites.

## Source expansion mode

Source expansion is a separate subfunction. Do not run it during ordinary news
research reports.

Use source expansion mode only when the user explicitly asks for it with a
request such as:

* "have a look at our sources";
* "expand our sources";
* "scan the source list";
* "find sub-sources";
* "check whether these sources have other useful sections".

Source expansion takes existing source entries from one or more of:

* `resources/sources.new.yaml`;
* reviewed `resources/sources/*.yaml` collections;
* source entries or URLs supplied directly by the user.

For each selected source, inspect the website as a source, not as a news story.
Look for reusable sibling or child entry points that have distinct rescanning
value, such as:

* a second news section with different content;
* language-specific news sections;
* RSS or Atom feeds;
* topic, tag, category, search, press-release, announcement, event, tourism,
  transport, environment, entertainment, or business sections;
* official social profiles or newsletter archives linked from the source;
* regional pages that split Samui, Surat Thani, Thailand, or Asia coverage;
* public archive pages that are more stable than the homepage.

When a useful sub-source is found, append it to `resources/sources.new.yaml`
using the documented source format. Preserve existing entries. Do not promote
sources into reviewed `resources/sources/*.yaml` collections during expansion
unless explicitly instructed.

For sub-sources, include:

* `parent_source`: the source name or domain the candidate was discovered from;
* `relation`: a short relationship such as `language-section`,
  `sibling-news-section`, `rss-feed`, `topic-page`, `event-calendar`,
  `press-archive`, `official-profile`, or `regional-section`;
* `search_notes`: why this sub-source has distinct rescanning value.

Avoid duplicates by comparing URL, canonical URL, source name, parent domain,
and whether the candidate merely duplicates an already collected broader source.

Source expansion output should be a short summary:

* sources inspected;
* candidates added to `resources/sources.new.yaml`;
* promising candidates already present;
* sources that could not be inspected;
* follow-up questions or decisions for Patrick.

## Source discovery

Read `resources/sources.md` before beginning research.

Use `resources/sources.md` to understand the source model. Reviewed,
rescannable source collections live in topic files under `resources/sources/`.
Unreviewed source candidates live in `resources/sources.new.yaml`.

The listed and reviewed sources are additive, not exclusive.

For every report:

1. read `resources/sources.md`;
2. check relevant reviewed collections in `resources/sources/*.yaml`;
3. check relevant candidates already collected in `resources/sources.new.yaml`;
4. search beyond those lists;
5. identify newly useful recurring sources;
6. include promising additions in the final source recommendations;
7. after returning the report, append all newly found recurring source
   candidates to `resources/sources.new.yaml` using the documented YAML source
   format.

Do not remove or rewrite existing `resources/sources.new.yaml` entries during a
research run. Keep existing candidates in place for later human review.

Avoid duplicate source candidates. Before appending, compare by canonical URL,
publication or organisation name, and parent domain against:

* existing `resources/sources.new.yaml` entries;
* reviewed source collections in `resources/sources/*.yaml`;
* source candidates already discovered during the same run.

Treat "source" as a recurring entry point, publication, organisation, feed,
archive, search page, topic page, event calendar, or official profile. Do not
collect every one-off article URL as a source candidate unless that URL is also
a stable reusable source entry point.

Prefer original and primary sources whenever available:

* government announcements;
* municipal or provincial authorities;
* police, courts, and regulatory agencies;
* event organisers;
* airports, airlines, ferries, and transport operators;
* official tourism organisations;
* direct company announcements;
* original local reporting.

Use secondary media to establish context, reactions, wider relevance, and differing interpretations.

Source promotion is a separate editorial maintenance step. Do not move entries
from `resources/sources.new.yaml` into reviewed `resources/sources/*.yaml`
collections unless explicitly instructed.

## Research categories

Actively investigate all of the following categories:

### Tourism and travel

- visitor numbers;
- tourism awards;
- hotel and resort developments;
- airline routes;
- airport developments;
- ferry services;
- travel advisories;
- visa or tourism policy changes;
- seasonal travel trends;
- travel costs, scams, insurance, consular travel notices, and bureaucracy that
  Germans planning or living in Thailand would care about;
- major international media coverage.

### Events and entertainment

- festivals;
- concerts;
- nightlife;
- cultural events;
- sporting events;
- markets;
- exhibitions;
- film and television productions;
- celebrity, film, television, music, sport, and entertainment coverage
  involving Samui, Thailand, or a relevant regional connection;
- people coming to Thailand, international attention around Thailand, and
  public figures whose visits create cultural or tourism stories;
- announced future events relevant to residents or visitors.

### Infrastructure and transport

- roads;
- drainage;
- airport plans;
- ferry terminals;
- public transport;
- taxis;
- traffic;
- electricity;
- water supply;
- waste management;
- telecommunications;
- construction projects;
- Thailand-wide transport, aviation, rail, ferry, payment, and public-service
  infrastructure when it affects visitors, residents, or Samui access.

### Environment and safety

- storms;
- flooding;
- drought;
- marine conditions;
- beach conditions;
- pollution;
- rubbish and wastewater;
- coral reefs;
- animal welfare;
- accidents;
- fires;
- public-health warnings;
- tourist safety;
- regional health, weather, epidemic, environmental, or safety signals that may
  affect Thailand or travel to Thailand.

### Government, law, and business

- municipal decisions;
- national policies affecting Samui;
- land ownership;
- nominee structures;
- property developments;
- legal disputes;
- raids and investigations;
- business openings and closures;
- economic developments;
- labour and employment issues;
- monarchy and royal events as public/cultural context;
- visa, immigration, residency, foreign ownership, nominee, taxation, banking,
  and consular issues relevant to Germans or other foreign residents.

### Local life and culture

- local personalities;
- community initiatives;
- temples;
- schools;
- food;
- traditions;
- neighbourhood changes;
- historical anniversaries;
- unusual local stories;
- stories that international reporting overlooks.

### German-reader interest

- topics German visitors, residents, retirees, families, or long-stay travellers
  would ask about before or during time in Thailand;
- stories where German-language coverage differs from Thai or English coverage;
- German media attention around Thailand, Samui, tourism, safety, law, culture,
  people, or travel;
- practical Thailand-life context that is useful to explain in German;
- opinionated blog-fit topics: strange bureaucracy, tourism narratives, cultural
  misunderstandings, expat life, daily-life friction, public rituals, media
  exaggeration, and Thailand stories that are funny, revealing, or worth arguing
  with.

## Verification rules

For every potentially included story:

1. identify the publication date;
2. identify the actual event date where possible;
3. distinguish an announcement from an event that already happened;
4. find the original source where possible;
5. look for independent confirmation;
6. note discrepancies in dates, numbers, locations, or claims;
7. avoid treating copied syndicated articles as independent confirmation;
8. identify press releases and promotional reporting;
9. do not infer facts that sources do not establish.

A story should normally have at least one reliable source.

Important, disputed, political, legal, criminal, environmental, or safety-related claims should ideally have:

- a primary source; or
- two credible independent sources.

When only one source exists, state that clearly.

## Citation method

Use the repository citation convention in
`documentation/source-citations.md`.

When a report item is likely to be copied into a post, provide Markdown
footnotes that can be copied with the text. Use named source identifiers, not
numeric identifiers.

Use this identifier pattern:

```text
[^src-<source-slug>-<yyyymmdd>-<topic-slug>]
```

Examples:

```markdown
Die neue Faehrverbindung soll im August starten.[^src-bangkokpost-20260720-samui-ferry]

[^src-bangkokpost-20260720-samui-ferry]: Bangkok Post: ["New ferry route for Samui"](https://example.com/new-ferry-route), 20 July 2026 (accessed 22 July 2026).
```

For every cited source item, capture the available citation data:

* publication or organisation name;
* source item title;
* author or issuing body when named;
* publication date;
* event date when different from publication date;
* canonical URL;
* language;
* access date for volatile pages, live pages, social posts, PDFs, or pages that
  may change;
* archive URL when available and useful;
* caveat when the source is a press release, promotional item, social-only
  claim, translation, syndicated copy, or single-source claim.

In the footnote definition, link the source item title by default:
`Publication: ["Title"](https://example.com/source), publication date (accessed
access date)`. Use a raw URL only when the title is unavailable, unstable, or
the exact URL is editorially relevant.

The report must keep the footnote marker and definition close enough that
Patrick can copy a story, paragraph, or topic idea into a post without losing
the citation. Do not output bare source lists that are disconnected from the
text they support.

## Duplicate and syndication handling

Group articles that describe the same underlying event.

Do not list every rewritten article as a separate story.

For each grouped story:

- identify the earliest or most original source;
- list useful secondary coverage;
- note whether international, German, English, or Thai reporting adds a different angle;
- highlight mistranslations, omissions, exaggerations, or inconsistencies where relevant.

## Editorial relevance

Do not merely ask whether a story is newsworthy.

Assess whether it could become a useful article for Patrick's long-running
German-language personal blog about life in Thailand, with Koh Samui as the
centre of gravity.

Prefer topics that support one or more of these angles:

- Samui circle relevance;
- Thailand circle relevance;
- Asia/Region circle relevance with a clear Thailand or German-abroad link;
- practical consequences for residents;
- practical consequences for visitors;
- practical consequences for Germans living in, moving to, or travelling to
  Thailand;
- contrast between tourism marketing and daily reality;
- historical comparison with older Samui;
- changes visible over the blog's 21-year history;
- local context missing from international reporting;
- German-language framing that misses Thai/local context;
- entertainment, people, royal/public events, culture, film, television, music,
  sport, and odd public stories when they fit one of the three circles;
- opportunities for personal observation or photography;
- topics that can be revisited after further developments;
- amusing, strange, contradictory, or distinctly Thailand/Samui-specific stories.

Do not prioritise general technology topics merely because Patrick also writes
about technology elsewhere. Include technology only when it is materially about
Thailand life, travel, bureaucracy, public services, local infrastructure,
media/censorship, scams, privacy, or payments.

## Required output structure

Use the following headings exactly and in this order.

# Samui Samui News Brief

Immediately below the title, state:

- research period;
- date the report was created;
- languages researched;
- brief note on the scope;
- short explanation of the three circles of interest and A/B/C relevance
  weights used.

## Timeline

Create a compact chronological timeline covering the research period.

Use a fenced text block or similarly compact representation.

Each item must contain:

- date;
- short event label;
- circle (`Samui`, `Thailand`, or `Asia/Region`);
- relevance weight (`A`, `B`, or `C`);
- category.

Do not include stories solely to make every date appear populated.

## Dated event list

List the researched stories chronologically and grouped under these exact
subheadings:

### Samui

### Thailand

### Asia/Region

Use headings in this form:

#### June 25 — Koh Samui erhält eine internationale Inselauszeichnung

For every entry include:

**Kreis und Relevanz**

Use `Samui`, `Thailand`, or `Asia/Region`, plus relevance `A`, `B`, or `C`.
Briefly explain why the story belongs there.

**Was passiert ist**

A concise factual summary.

**Warum das interessant ist**

Explain its relevance to Samui, Thailand, German readers, residents, visitors,
or the blog.

**Möglicher Blogwinkel**

Suggest one or more concrete editorial angles. Be opinionated about what German
readers may care about, but do not pretend that every story must become a post.

**Quellenlage**

Describe:

- original or primary source;
- secondary reporting;
- language coverage;
- whether the story is confirmed, announced, promotional, disputed, or incomplete.

**Quellen**

Provide the relevant source links with publication names and dates.

**Kopierbare Quellen-Fussnoten**

Provide a compact copy-pasteable Markdown snippet containing the source
footnote markers and matching definitions for the story. Use named `[^src-...]`
identifiers following `documentation/source-citations.md`. Include definitions
directly below the snippet so copying a single story does not lose its sources.

Where useful, include:

**Weiter beobachten**

Explain what future decision, result, event, publication, or consequence should be checked later.

## Thematic reading

Interpret the collected reporting under these exact subheadings:

### Tourism and travel

### Events and entertainment

### Infrastructure and transport

### Environment and safety

### Government, law, and business

### Local life and culture

### German-reader angle

The section should synthesise patterns across stories.

Do not simply repeat the dated event list.

Explicitly mention:

- recurring themes;
- contradictions;
- differences between Thai and international coverage;
- differences in German-language framing;
- stories receiving disproportionate publicity;
- important local stories receiving little outside attention;
- which `A`, `B`, and `C` items are worth acting on now versus watching.

## Emerging trends and visitor risks

Identify broader developments that may affect:

- residents;
- tourists;
- businesses;
- transport;
- safety;
- the environment;
- Samui's public image;
- Thailand's public image among German readers;
- German residents, visitors, retirees, families, or long-stay travellers.

Separate well-supported trends from tentative observations.

Use labels such as:

- `Belegt`
- `Wahrscheinliche Entwicklung`
- `Frühes Signal`
- `Unklar`

Do not exaggerate isolated events into trends.

## Blog topic shortlist

Produce a prioritised list of potential blog topics.

For each topic include:

**Arbeitstitel**

A useful German working title.

**Kernfrage**

The central question the article would answer.

**Warum jetzt**

Why the topic is timely.

**Kreis und Relevanz**

Use `Samui`, `Thailand`, or `Asia/Region`, plus relevance `A`, `B`, or `C`.
Explain the weighting.

**Eigener Samui/Thailand-Winkel**

How the article could go beyond rewriting news coverage.

**Benötigte Ergänzungen**

What Patrick should inspect, photograph, verify, remember, or research before writing.

**Haltbarkeit**

Choose one:

- `Sofort schreiben`
- `In den nächsten Wochen`
- `Zeitlos mit aktuellem Anlass`
- `Beobachten`

**Priorität**

Choose one:

- `Sehr hoch`
- `Hoch`
- `Mittel`
- `Niedrig`

Prioritise quality over quantity.

The default target is 10–20 strong topics. Most should usually be `A` or `B`.
Include `C` topics only when they are useful watchlist items or unusually good
signals.

Do not create weak topics merely to reach a target count.

## Stories not recommended

Briefly list stories that were considered but should not become blog topics.

Possible reasons include:

- only loosely connected to the three circles of interest;
- duplicated press-release coverage;
- insufficient evidence;
- trivial promotional content;
- no meaningful editorial angle;
- old event republished during the research period;
- misleading headline;
- primarily about another location;
- belongs on `kollitsch.dev` or another outlet rather than `samui-samui.de`.

## Source landscape

Assess the source environment used in the report.

Include:

### Strong primary sources

### Useful local and regional media

### Useful national and international media

### German-language coverage

### Weak, promotional, or unreliable sources

### Newly discovered source candidates

For each newly discovered candidate, explain:

- what it covers;
- which language it uses;
- why it may be worth keeping for review in `resources/sources.new.yaml`;
- any reliability caveats.

After presenting the report, update `resources/sources.new.yaml` with all newly
found recurring source candidates that are not already present there or in
reviewed `resources/sources/*.yaml` collections. Use the YAML source format
defined in `resources/sources.md`, preserve existing candidates, and do not sort
or promote entries during the report run.

## Research gaps

State what could not be reliably established.

Examples:

- inaccessible articles;
- paywalled coverage;
- contradictory dates;
- missing primary documents;
- claims available only through social media;
- Thai reports without independent confirmation;
- events announced without a subsequent result.

## Recommended next research

End with a short list of concrete follow-up investigations that could materially improve one or more proposed blog topics.

Do not end with a generic conclusion.

## Citation and link requirements

Every dated story must contain source links.

Prefer direct links to the relevant article, announcement, event page, or document.

Do not link only to a publication homepage when a direct article URL exists.

Preserve Thai titles where useful, followed by a German explanation.

Clearly identify publication dates and event dates.

## Writing style

The report must be:

- written in German;
- concise but substantial;
- factual;
- editorially useful;
- sceptical of tourism marketing;
- respectful of Thai sources and context;
- clear about uncertainty;
- free of generic AI filler;
- free of invented local knowledge.

This is a research document, not a polished article for publication.
