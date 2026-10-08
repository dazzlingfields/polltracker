# NZ Poll Lab

[Open the tracker](https://dazzlingfields.github.io/polltracker/).

## Add or edit a poll

Open **Poll sheet → Add a poll**. Select the polling house and enter fieldwork end, release date, sample size, seven decided party-vote percentages, and the original report link. Click **Add poll and update projection**. The editable table also lets you correct values, dates, source links, and inclusion. The newest eligible observation replaces that house's previous observation in the average. Previous polls remain in the sheet.

The Parliament graphic recalculates immediately. Its **Adjust vote swings and electorate assumptions** controls let you move party vote swings and test TPM electorate wins. All charts, seat tables, and scenarios use the same underlying calculation.

## Update the shared website

Edits save in your browser. To share them:

1. Click **Download poll sheet**, saving `polls.json`.
2. Click **Update the shared sheet on GitHub**. Replace that file's contents with the downloaded JSON and commit to `main`. Alternatively, upload the downloaded file to the repository root, replacing `polls.json`.
3. GitHub Actions validates the sheet, rebuilds the app and standalone Parliament SVG, and deploys them. Invalid dates, duplicate house/date rows, and totals above 100% stop publication with an error in Actions.

**Import poll sheet** merges rows by house and fieldwork end, replacing matches after confirmation while retaining settings. **Use published polls** loads published inputs while retaining weighting and scenario settings. New published rows merge into saved sheets on revision; locally edited matching rows are preserved. A saved date following the previous published snapshot advances with it. A deliberately selected historical date stays fixed. Use **Use published polls** to load published corrections to existing rows.

`polls.json` is the authoritative published data. Its `asof` field sets the snapshot date. Each `v` array uses this order: National, Labour, Green, ACT, NZ First, Te Pāti Māori, Opportunity. `enabled` is true or false. Missing sample sizes and unverified release dates may be null. The quick-entry form requires a release date and source. Keep electorate-only polls out of this national average.

## Weighting

Use one latest eligible poll per house in the editable 35-day window. House weights are 1 for Verian, Curia, Reid Research, Freshwater and Anacta; **Roy Morgan defaults to 0.5**. Its control offers 0, 0.25, 0.5 and 1. The comparison table shows normalised contributions. Talbot Mills and Anacta share one series key.

The half-weight setting is an adjustable assumption, not a fitted quality score. Roy Morgan's September report used landline/mobile telephone interviews over 31 August–27 September, a longer fieldwork period than the other latest releases. [Original methodology](https://www.roymorgan.com/findings/10351-nz-national-voting-intention-september-2026). Historical accuracy benchmarks and joint error replays retain their original equal-weight calibration; they are descriptive stress tests, not calibrated probabilities for the weighted model.

Default electorate floors are one each for ACT and Te Pāti Māori. Sainte-Laguë allocation, the 5% list threshold, electorate exemption and overhang are included. Manual vote swings are added, negative shares clipped, and the complete vector normalised to 100%. Seat calculations are conditional on those assumptions, not probabilities of coalition agreements.

## Development and GitHub Pages

Open `index.html` directly or run `node preview.cjs`. The built app is self-contained and uses no external JavaScript or APIs.

After editing `polls.json`, run `node build.cjs`, then `node checks.cjs`. The builder embeds validated data, the shared parser and `sheet-ui.js` controls into `index.html`. Checks exercise weighting, dates, new polls, deduplication and MMP rules against retained fixtures, and generate the current `parliament.svg`. The CI workflow publishes only `index.html`, `parliament.svg`, and `polls.json`. Select **GitHub Actions** in repository **Settings → Pages**. All paths support the `/polltracker/` repository URL. [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

This recovered project has nine recent observations, rather than the later 38-poll archive mentioned in the previous chat. The original attachment remains in `archive/`. `update.cjs` is retired and must not regenerate this app.

Sources: [TPU–Curia](https://www.taxpayers.org.nz/oct2026_nztucurpolljjhhfas), [1News–Verian](https://www.1news.co.nz/2026/10/06/poll-opportunity-still-in-kingmaker-seat-as-greens-hold-strong/), [Roy Morgan](https://www.roymorgan.com/findings/10351-nz-national-voting-intention-september-2026). Each sheet row retains its source and methodology notes.
