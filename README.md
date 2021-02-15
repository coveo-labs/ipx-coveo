# IPX Coveo

Using this chrome extension to access Coveo at Coveo through IPX.
It supports Google Drive, Google Docs/Sheets, Confluence, Jira.
When the extension cannot be properly loaded. The Searchbox will not be shown.

## Installation

You can load it manually in your browser from the extension page. (chrome://extensions/)=

## Build extension package

Bash command to build the package for the Chrome Web Store:

> `zip -r9 coveo_ipx_v$(node -p -e "require('./manifest.json').version").zip manifest.json images js`

## Dependencies

Google Chrome or Chromium
