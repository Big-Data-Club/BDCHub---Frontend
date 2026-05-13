import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'


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
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  }
};


export default preview;