# NZ Poll Lab

Open `index.html` directly or serve this folder. No installation, build, account, API, or external JavaScript is needed. All calculations run in the browser.

## Latest update

Checked 8 October 2026, Pacific/Auckland. Added the October TPU–Curia release (1–5 Oct fieldwork), October 1News–Verian release (1–5 Oct), and September Roy Morgan release (31 Aug–27 Sep). Sources and separate publication dates are in the calculator. The poll average selects the latest eligible observation per house with equal weights and a 35-day fieldwork-age window.

This project was recovered from the available local attachment. That attachment was an earlier six-poll calculator, rather than the later 38-poll archive and probability simulator mentioned in the previous chat. The earlier attachment is retained in `archive/`. This version contains nine recent observations, historical accuracy analysis, historical-error scenarios, a poll comparison table, recent party charts, and a downloadable Parliament SVG. It does not claim to restore the unavailable full-year archive or its simulations.

The Parliament graphic uses the selected scenario and electorate floors. It defaults to one ACT electorate and one Te Pāti Māori electorate, with other floors at zero. The 5% threshold, electorate exemption and overhang are included. These are conditional seat calculations, not probabilities of forming a government.

## GitHub Pages

Create a repository for this project and push the contents of this `poll` folder to its `main` branch. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The included workflow validates the calculator and publishes only `index.html` and `parliament.svg`.

For a different default branch, update `.github/workflows/pages.yml`. The app works at a repository URL such as `https://USERNAME.github.io/REPOSITORY/` because it has no root-relative asset paths. GitHub Pages serves static files, so poll acquisition remains manual and browser edits are saved only for that browser/origin. Export JSON to transfer them.

## Project files

- `index.html`: self-contained calculator, current data, and live seat graphic.
- `parliament.svg`: exported baseline graphic as at 8 October.
- `checks.cjs`: calculation and input checks; run with `node checks.cjs`.
- `update.cjs`: reproducible upgrade from the retained original attachment.
- `archive/`: retained source attachment.
- `.github/workflows/pages.yml`: static publishing workflow.

To publish changed starting data, update `CURRENT` and the source-check date in `index.html` and push. UI edits are browser-local and do not modify the hosted file. The updater regenerates this version from the original attachment, so avoid running it after manual source changes unless those changes are also added to the updater.

Sources: [TPU–Curia](https://www.taxpayers.org.nz/oct2026_nztucurpolljjhhfas), [1News–Verian](https://www.1news.co.nz/2026/10/06/poll-opportunity-still-in-kingmaker-seat-as-greens-hold-strong/), [Roy Morgan](https://www.roymorgan.com/findings/10351-nz-national-voting-intention-september-2026). GitHub workflow guidance: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
