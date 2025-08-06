# Cellular Automata Editor

A React-based web application for creating and exploring cellular automata patterns. Generate beautiful geometric designs using elementary cellular automata rules.

## Features

- **Interactive Grid Editor**: Draw and erase cells in the first row
- **Rule Selection**: Choose from 256 possible elementary cellular automata rules
- **Popular Rules**: Quick access to well-known rules like Rule 30, 90, 110, and more
- **Real-time Animation**: Watch patterns generate row by row
- **Export Options**: Save as SVG or copy to Figma
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd cellular-automata-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Set up the grid**: Use the configuration panel to set columns, rows, and rule number
2. **Draw the seed**: Click or drag in the first row to create your initial pattern
3. **Generate**: Click "Generate Pattern" to watch the cellular automata evolve
4. **Export**: Use "Save SVG" or "Copy to Figma" to export your creation

## Popular Rules

- **Rule 30**: Chaotic pattern generator, used in Mathematica's random number generator
- **Rule 90**: Sierpinski triangle generator, creates fractal patterns
- **Rule 110**: Turing complete, capable of universal computation
- **Rule 184**: Traffic flow model, simulates highway traffic patterns

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

## License

MIT 