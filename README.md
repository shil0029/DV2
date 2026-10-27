# Gone fishing

A single-page data story about recreational fishing in Australia for FIT3179 Data Visualisation 2. All charts are original Vega or Vega-Lite specifications. HTML, CSS and a small JavaScript loader present the page; no application framework or build service is required.

## Run locally

From this directory, run `python3 -m http.server 8000 --bind 127.0.0.1`, then visit `http://127.0.0.1:8000`. A local server is necessary because browsers restrict data requests from `file://` URLs.

## Repository structure

- `index.html`, `css/`, `js/`: the single-page presentation.
- `specs/`: readable, standalone Vega/Vega-Lite JSON for every chart.
- `data/`: compact source extracts, map geometry and provenance.
- `scripts/`: reproducible data preparation and chart specification generation.
- `vendor/`, `fonts/`: local, pinned dependencies and font licences.

## Data scope

National participation estimates come from the National Social and Economic Survey of Recreational Fishers 2018–2021 (Moore et al., 2023). The detailed catch comparison comes from NSW DPIRD's 2023/24 survey appendices, which include comparable estimates from 2017/18 onward. These cover different populations and years and are labelled separately. Catch numbers are survey estimates, not fish abundance measurements.

The national report covers adult participation, while the NSW survey covers households holding long-term fishing licences. The two sources support complementary chapters; their values are not merged into one population or time series. The national source landing page and NSW survey listing were rechecked on 27 October 2026. NSW's 2023/24 report remains the latest published catch survey on that listing, which describes the 2025/26 survey as underway.

## Chart choices

| Chart | Idiom | Reader's task |
| --- | --- | --- |
| 01 | Waffle | Understand what 20% national participation means |
| 02 | Choropleth map | Compare participation rates between regions |
| 03 | Slope graph | Compare age-group participation in two survey years |
| 04 | Proportional symbol map | Compare the sizes of regional fishing communities |
| 05 | Treemap | See the composition of the monitored NSW catch |
| 06 | Heatmap | Compare species' release shares across four surveys |
| 07 | Dumbbell | Compare two catch estimates on one aligned scale |
| 08 | Line chart with species selector | Follow one species across four surveys |
| 09 | Sankey | Follow estimated catches into kept and released outcomes |
| 10 | Flow map with origin selector | See interstate employment connections from fishing spending |
| 11 | Ranked bar chart | Compare GDP contributions associated with spending categories |

## Domain, who, why, what and how

**Domain:** Australian recreational fishing, specifically participation, species caught and released, and the economic contribution associated with the hobby. This addresses assigned topic 16: Fishing.

**Who:** an Australian general audience, appropriate to the Clayton campus brief. Readers need no specialist fisheries or statistics knowledge. The page explains GDP, full-time equivalent employment and the differences between participation rates, fisher counts and catches.

**Why:** help readers understand how widespread fishing is, how participation differs between regions and age groups, how monitored catches vary across survey years, and how fishing-related spending supports activity beyond the fisher's home state. The story progresses from people, to catches, to the wider economy.

**What:** two public research sources supply real survey estimates. Moore et al.'s *National Social and Economic Survey of Recreational Fishers 2018–2021* (FRDC, ABARES and University of Canberra, published 2023) supplies weighted adult participation rates for 2018 and 2020, regional fisher counts for 2018, and modelled economic contributions for 2018–19. NSW DPIRD's 2023/24 survey appendices supply catch, kept and released estimates for 20 monitored species or groups across four surveys from 2017/18. Its telephone-diary method follows households with long-term fishing licences. These are different populations, not interchangeable national estimates. Source numbers were transcribed from labelled tables or numerical figure labels; release shares and interstate aggregates are documented calculations. Natural Earth provides public-domain map boundaries. Sources and provenance are linked on the page and supplied in `data/`.

**How:** the chart-choice table above connects each idiom to a reading task. Position supports precise comparisons in the slope, dumbbell, line and bar charts. Area supports composition in the treemap and proportional counts on the symbol map; the waffle makes the headline percentage concrete. The heatmap places species and years on a common 0–100% colour scale. The Sankey preserves the partition between kept and released catches, while the flow map encodes modelled employment with line width. Direct labels, concise takeaways, tooltips and source notes explain the evidence. The species and origin selectors each answer a specific follow-up question, updating charts and plain-language summaries without replacing page sections. The page uses original Vega/Vega-Lite specifications, including custom Vega treemap and Sankey layouts, with responsive widths and locally bundled fonts and libraries.

No fishing-season claims are inferred from survey-year totals. Catch estimates do not measure fish abundance, releases do not establish survival, and the economic flows are not travel routes.

All three maps use a conic equal-area projection configured for Australia. Participation colour encodes a rate, symbol area encodes fisher counts, and flow width encodes FTE employment. NSW/ACT stays combined in the participation maps; ACT is separate and explicitly labelled in the economic map. A diamond distinguishes the selected origin from destination circles, and circle/diamond markers distinguish the dumbbell chart's survey years.

## Rubric review — 27 October 2026

Reviewed in the order of the supplied brief, pages 5–6. This records the evidence and changes, rather than assigning a mark.

| Rubric section | Review and resulting changes |
| --- | --- |
| Sketch — 2% | Excluded at the owner's request. There is no hand-drawn sketch submission to assess. |
| Idioms and complexity — 8% | 11 distinct charts, including choropleth, proportional-symbol and flow maps. Nine named idioms fall outside the rubric's basic-idiom list; the line and ranked bar are basic. Preserved appropriate rate, area, position and width encodings. Clarified NSW/ACT, added an ACT callout, improved the flow-width legend, and added redundant marker shapes. |
| Layout, colour, figure-ground — 3% | Retained aligned columns and the continuous story. Replaced cream/teal with cool white, slate blue and muted copper. Darkened treemap fills for readable white labels, used a light label on the darkest map region, and removed the hero panel's rotation. |
| Typography — 2% | Retained locally licensed Fraunces and DM Sans. Increased captions, source notes and introductory text; limited long reading lines. Treemap labels have more than 4.5:1 contrast against their fills. |
| Storytelling, annotations, grammar and style — 5% | Added direct map rates, a slope annotation, heatmap percentages, timeline values and an updating species summary, Sankey totals/shares and GDP bar labels. Explained abbreviated units and GDP; simplified uncertainty language. Preserved dated sources, author, provenance and AI acknowledgement. Fixed the mobile Sankey's crossed columns. |
| Description of domain, who, what, why, how — 2% | Expanded the rationale above with audience, purpose, source methods, population limits, mark/channel choices and interaction rationale. |
| Interview — 3% | Excluded at the owner's request. It is not something the website can complete. |

The additional brief requirements remain in place: one public scrolling GitHub page, readable chart JSON in the same repository, two research sources, three map idioms, small local datasets, attribution and meaningful interaction. The hand-drawn sketch and interview exclusions remain separate from the website improvements.

## Check and regenerate

`npm run check` validates the 80 catch records, 56 interstate flows, all 11 chart specifications and local file references. `python3 scripts/prepare-nsw.py` regenerates the documented NSW extract. `npm run build:specs` regenerates the readable chart JSON. The pinned browser bundles are also used by the checker, so no npm install is needed.

Browser verification covered 1280px and 1024px laptop viewports and a 390px phone viewport. All 11 charts rendered, all 20 species and eight origin selections matched their source data, and the page had no horizontal overflow. Live resizing was checked for treemap label alignment, Sankey direction and clipped chart text. The extracted datasets and geometry total approximately 100 KB. Font and runtime files are bundled locally.

## GitHub Pages

Live visualisation: [Gone fishing](https://shil0029.github.io/DV2/).

GitHub Pages publishes from **main → /(root)** using **Deploy from a branch**. Future pushes to `main` trigger an updated deployment; progress appears in the repository's Actions tab. When publishing later asset changes, update the CSS/JavaScript version query in `index.html` and `assetVersion` in `js/app.js` together so returning readers receive matching styles, code and chart specifications.

The published site was verified on 26 October 2026: all 11 charts rendered, both selectors updated their charts and supporting text, and the browser reported no errors or warnings.

Reference: [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Attribution

Author: Sean Hilder. Created 26 October 2026. Developed with assistance from OpenAI Codex for research, data transcription, code, chart design, wording and verification. This acknowledgement should also accompany any assessment submission. No third-party charts have been copied into the page.

The hand-drawn sketch and interview are outside this repository's deliverables, as requested. The page and repository do not establish completion of those assessment components.
