module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        comic: ['Bangers', 'cursive'],
        body: ['"Comic Neue"', '"Comic Sans MS"', 'cursive'],
      },
      colors: {
        ink: '#1a1a1a',
        paper: '#FFF8E7',
        pop: {
          yellow: '#FFD93D',
          pink:   '#FF6B9D',
          blue:   '#4D96FF',
          green:  '#6BCB77',
          red:    '#FF4E4E',
          purple: '#B983FF',
        },
      },
      boxShadow: {
        comic: '6px 6px 0 #000',
        'comic-sm': '4px 4px 0 #000',
      },
    },
  },
  plugins: [],
}