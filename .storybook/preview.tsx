import type { Preview } from '@storybook/nextjs-vite'
import React from 'react';
import '../src/app/globals.css'
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '../src/store/UserContext';

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
    (Story) => (
      <UserProvider>
        <SessionProvider session={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="bdc-theme-storybook"
          >
            <Story />
          </ThemeProvider>
        </SessionProvider>
      </UserProvider>
    ),
  ],
};

export default preview;