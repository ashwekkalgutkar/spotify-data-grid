# Spotify Tracks Dashboard

A high-performance React application for exploring and analyzing 30,000+ Spotify tracks through an interactive data grid. Features fast filtering, sorting, pagination, and CSV export capabilities.

## Live Demo

[![Deployed App](https://img.shields.io/badge/Live%20Demo-Deployed-blue?style=flat&logo=vercel)](https://spotify-data-grid-hlcegiql1-ashweks-projects.vercel.app/)

## Features

- **Data Grid**: Smooth rendering of 30K+ Spotify tracks with AG Grid virtualization
- **Column Filtering**: Text, numeric, and categorical filters across 8+ columns
- **Sorting**: Single-click column sorting with visual indicators
- **Pagination**: Configurable page sizes (25/50/100/200 rows)
- **Multi-Select**: Checkbox selection with header "select all" and live counts
- **CSV Export**: Download current filtered/sorted view as `spotify_tracks_export.csv`
- **Live Stats**: Total, displayed, and selected row counts
- **Responsive**: Desktop and tablet optimized with resizable columns

## Tech Stack

React 18 - AG Grid Community - PapaParse - Lucide React - Tailwind-inspired CSS


## Quick Start

Clone & install
git clone <your-repo-url>
cd spotify-tracks-dashboard
npm install

Add dataset to public folder
Download: https://www.kaggle.com/datasets/joebeachcapital/30000-spotify-songs
Place: public/spotify_songs.csv
Run
npm start

text

**Dataset**: 30,000 Spotify tracks with track details, audio features, and metadata [Kaggle]

## Screenshots

![Dashboard](public\dashboard.png)
<!-- ![Grid Features](https://via.placeholder.com/1200x400/f9fafb/ffffff?text=Filtering+Sorting+Export) -->

## Performance

- **Initial Load**: ~1-2s (CSV parse + render 30K rows)
- **Filter Response**: <300ms
- **Smooth Scrolling**: 60fps via AG Grid virtualization

## Project Stats

- **Development Time**: 3 hours
- **Data Loading**: Client-side CSV parsing with PapaParse
- **Bundle Size**: Optimized with memoized column definitions

## Architecture Highlights

- Memoized `columnDefs` and `defaultColDef` for render performance
- Custom pagination/selection stats tracking
- AG Grid Alpine theme with dashboard styling
- Pinned checkbox + S.No columns for better UX

## License

MIT License - see `LICENSE` file for details.