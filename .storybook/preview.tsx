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
              <div className="lms-fonts antialiased min-h-screen w-full">
                {/* HTML link tags to guarantee Google Fonts are loaded in Storybook */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&family=Nunito+Sans:ital,wght@0,300;0,400;0,650;0,700;1,400&family=Geist+Mono:wght@400;700&display=swap" rel="stylesheet" />
                
                {/* Enforce CSS font families for storybook wrappers */}
                <style>{`
                  .lms-fonts {
                    font-family: 'Nunito Sans', sans-serif !important;
                  }
                  .lms-fonts h1,
                  .lms-fonts h2,
                  .lms-fonts h3,
                  .lms-fonts h4,
                  .lms-fonts h5,
                  .lms-fonts h6 {
                    font-family: 'Comfortaa', sans-serif !important;
                  }
                  .lms-fonts pre,
                  .lms-fonts code,
                  .lms-fonts .font-mono {
                    font-family: 'Geist Mono', monospace !important;
                  }
                `}</style>

                <ThemeSync background={bgValue} />
                <Story />
              </div>
            </ThemeProvider>
          </SessionProvider>
        </UserProvider>
      );
    },
  ],
};

export default preview;