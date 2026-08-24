# Guitar Chord Hub

A modern, SEO-friendly web application for guitar chords, built with Next.js and Tailwind CSS. Easy to deploy on free hosting platforms like Vercel, Netlify, or Render.

## Features

- 🎸 Browse guitar chords with fingering diagrams
- 🔍 SEO optimized (meta tags, semantic HTML)
- 📱 Responsive design
- ⚡️ Fast performance with static generation
- 🛠️ Simple backend API (serverless) for chord data
- 🎨 Modern UI with Tailwind CSS
- 🚀 One-click deploy to Vercel (free tier)

## Project Structure

```
/guitar-chord-web
  /components       # React components (Layout, etc.)
  /data             # JSON data source for chords
  /lib              # Utility functions (chord data access)
  /pages            # Next.js pages and API routes
  /styles           # CSS (Tailwind)
  public/           # Static assets (favicon, etc.)
```

## Getting Started

### Prerequisites

- Node.js (>=14)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd guitar-chord-web
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Sign up at [Vercel](https://vercel.com) (free tier available).
3. Import your repository and Vercel will automatically detect it's a Next.js project.
4. Click "Deploy". Your site will be live at `your-project.vercel.app`.

### Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build the project: `npm run build`
3. Deploy: `netlify deploy --prod --dir=out`

### Render (Free Web Service)

1. Create a new Web Service on Render.
2. Connect your repository.
3. Set the build command: `npm install && npm run build`
4. Set the publish directory: `out`
5. Deploy.

## Customization

### Adding More Chords

Edit `data/chords.json` to add new chord objects. Each chord should have:

- `id` (unique string, used in URL)
- `name` (chord name)
- `difficulty` (Beginner/Intermediate/Advanced)
- `fingering` (string representation, e.g., "x32010")
- `description` (short text)

After updating, redeploy.

### Styling

Tailwind CSS is configured via `tailwind.config.js`. Modify colors, fonts, etc., there.

### SEO

Meta tags are set in `components/layout.js`. Adjust title, description, and keywords as needed.

## API Endpoints

- `GET /api/chords` – Returns all chords as JSON.
- Dynamic route `/chord/[id]` – Shows detail for a specific chord.

## License

This project is open source and available under the MIT License.

---

Enjoy playing guitar! 🎶