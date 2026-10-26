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

## Attribution

Author: Sean Hilder. Created 26 October 2026. Developed with assistance from OpenAI Codex for research, data transcription, code, chart design, wording and verification. This acknowledgement should also accompany any assessment submission. No third-party charts have been copied into the page.

The hand-drawn sketch and interview are outside this repository's deliverables, as requested. The page and repository do not establish completion of those assessment components.
