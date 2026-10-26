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

The previously downloaded commercial fisheries and aquaculture workbook is not used: it does not describe the assigned recreational fishing topic.

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

**What:** weighted survey estimates, categorical regions and species, ordered years, counts, rates and modelled economic contributions. **Why:** help an Australian general audience understand the reach and variety of recreational fishing. **How:** a sequential narrative with three distinct map idioms, shared scales for comparisons, direct annotations, source notes, tooltips and two focused selectors. No fishing-season claims are inferred from survey-year totals.

All three maps use a conic equal-area projection configured for Australia. Participation colour encodes a rate, symbol area encodes fisher counts, and flow width encodes FTE employment. National and NSW survey populations are not combined into a synthetic trend.

## Check and regenerate

`npm run check` validates the 80 catch records, 56 interstate flows, all 11 chart specifications and local file references. `python3 scripts/prepare-nsw.py` regenerates the documented NSW extract. `npm run build:specs` regenerates the readable chart JSON. The pinned browser bundles are also used by the checker, so no npm install is needed.

Browser verification covered a 1280px laptop viewport and 390px phone viewport, rendering all 11 charts, both selectors, and horizontal overflow. The extracted datasets and geometry total approximately 100 KB. Font and runtime files are bundled locally.

## GitHub Pages

Live visualisation: [Gone fishing](https://shil0029.github.io/DV2/).

GitHub Pages publishes from **main → /(root)** using **Deploy from a branch**. Future pushes to `main` trigger an updated deployment; progress appears in the repository's Actions tab.

The published site was verified on 26 October 2026: all 11 charts rendered, both selectors updated their charts and supporting text, and the browser reported no errors or warnings.

Reference: [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Attribution

Author: Sean Hilder. Created 26 October 2026. Developed with assistance from OpenAI Codex for research, data transcription, code, chart design, wording and verification. This acknowledgement should also accompany any assessment submission. No third-party charts have been copied into the page.

The hand-drawn sketch and interview are outside this repository's deliverables, as requested. The page and repository do not establish completion of those assessment components.
