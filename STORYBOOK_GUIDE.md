# Storybook Usage Guide

This project uses Storybook for UI component development and documentation.

## Getting Started

To start the Storybook development server:

```bash
npm run storybook
```

To build Storybook for production:

```bash
npm run storybook:build
```

## Project Structure

- `.storybook/`: Storybook configuration (Main, Preview, Theme).
- `src/**/*.stories.tsx`: Story files located alongside their components.

## Features

### 1. Tailwind CSS 4
Storybook is fully integrated with Tailwind CSS 4. Any Tailwind classes used in your components will be rendered correctly.

### 2. Dark Mode Support
You can toggle between Light and Dark modes using the toolbar at the top of the Storybook interface.

### 3. API Mocking (MSW)
We use `msw-storybook-addon` to mock API requests. This allows you to develop and test components that fetch data without needing a running backend.

To use MSW in a story:
```tsx
export const MockedStory = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/user', () => {
          return HttpResponse.json({ name: 'John Doe' })
        }),
      ],
    },
  },
};
```

### 4. Next.js Integration
Storybook is configured to support Next.js features like `next/navigation`, `next/image`, and the App Router.

## Best Practices

1. **Keep stories close to components**: Place `.stories.tsx` files in the same directory as the component.
2. **Use Autodocs**: We have enabled automatic documentation generation. Use JSDoc comments in your component props to document them.
3. **Mock complex dependencies**: Use MSW for data fetching and Storybook decorators for providers (Theme, Auth, etc.).
4. **Test accessibility**: Use the "Accessibility" tab in Storybook to ensure your components are inclusive.
