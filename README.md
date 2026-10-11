# Sage Macharia: portfolio

My portfolio site: selected work, how I work, experience and contact. It's for people hiring a full-stack engineer.

**Live:** [sagebeme.github.io/CV](https://sagebeme.github.io/CV/)

## Structure

- `index.html`: the home page
- `work/`: case studies for projects whose code is private (trading platform, rental platform, trading academy)
- `css/site.css`: all styles. Colours are tokens on `:root`, with a dark theme that follows the system setting
- `image/`: profile photo and favicon
- `beginner/`: a small browser game from my early web-dev days
- `react.html`: an old link, kept as a redirect to the projects section

Plain HTML and CSS, with no build step and no JavaScript. GitHub Pages serves the `Deproject` branch.

## Running locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.
