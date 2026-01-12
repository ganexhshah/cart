# Frontend - Next.js with Tailwind CSS and Shadcn/UI

This is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and configured with Tailwind CSS and Shadcn/UI.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful and accessible component library
- **ESLint** - Code linting and formatting

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/
│   │   └── ui/             # Shadcn/UI components
│   └── lib/
│       └── utils.ts        # Utility functions
├── public/                 # Static assets
└── components.json         # Shadcn/UI configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Adding Components

To add more Shadcn/UI components:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

## Customization

- **Colors**: Edit `tailwind.config.ts` to customize the color palette
- **Components**: Modify components in `src/components/ui/`
- **Global styles**: Edit `src/app/globals.css`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)