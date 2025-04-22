# Risk Simulation Game for Software Engineering

An interactive web-based simulation game that helps users understand and practice risk management in software engineering projects.

## Project Structure

```
risk-sim-2/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── game.js
│   │   ├── risk.js
│   │   ├── charts.js
│   │   ├── export.js
│   │   └── modal.js
│   ├── images/
│   │   └── vamk_logo_notext.svg
│   └── index.html
└── README.md
```

## Files Description

- `index.html`: Main HTML file containing the game structure
- `styles.css`: All CSS styles for the game interface
- `game.js`: Core game logic and state management
- `risk.js`: Risk-related functionality and risk table management
- `charts.js`: Chart initialization and updates using Chart.js
- `export.js`: Excel export functionality for risk register
- `modal.js`: Help modal functionality

## How to Run

1. Clone this repository
2. Open `public/index.html` in a web browser
3. No server setup is required as the game runs entirely in the browser

## Features

- Project setup with customizable budget and duration
- Risk identification and management
- Interactive simulation with turn-based gameplay
- Real-time project status tracking
- Visual charts for budget and quality monitoring
- Excel export functionality for risk register
- Comprehensive help system

## Dependencies

- Chart.js (loaded from CDN)
- SheetJS (loaded from CDN)

## Browser Compatibility

The game is compatible with modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## TO-DO

The task is to improve the existing simulation, either by building on top of it, or rewriting it from scratch.
Some missing features from user perspective are:

improve the gamification
no back button
export to Excel should be available throughout the simulation
make it more polished, now it looks like it's developed quick & dirty (which it is...)
unrealistically now all risks occur during the simulation, regardless of the probability
Some missing features from teacher point of view
Grading 0-5
Log of how the user played the simulation