import type { Preview } from '@storybook/nextjs-vite'
import React, { useEffect } from 'react';
import '../src/app/globals.css'
import { ThemeProvider, useTheme } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '../src/store/UserContext';

// Helper component inside ThemeProvider to synchronize next-themes with Storybook background setting
const ThemeSync = ({ background }: { background: any }) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // If background matches the light option, force next-themes to light. Otherwise, use dark.
    const isLight = background === '#F8FAFC' || background === 'light';
    setTheme(isLight ? 'light' : 'dark');
  }, [background, setTheme]);

  return null;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#F8FAFC' },
        dark: { name: 'dark', value: '#050B18' },
        "navy-shell": { name: 'navy-shell', value: '#070E1C' },
        "navy-section": { name: 'navy-section', value: '#0A1628' }
      }
    },
    nextjs: {
      appDirectory: true,
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  },

  decorators: [
    (Story, context) => {
      const bgValue = context.globals.backgrounds?.value;
      return (
        <UserProvider>
          <SessionProvider session={context.parameters.session !== undefined ? context.parameters.session : { user: { name: "BDC Developer", email: "developer@bdc.org" }, expires: "2026-09-09T00:00:00.000Z" }}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              storageKey="bdc-theme-storybook"
            >
              <ThemeSync background={bgValue} />
              <Story />
            </ThemeProvider>
          </SessionProvider>
        </UserProvider>
      );
    },
  ],
};

export default preview;