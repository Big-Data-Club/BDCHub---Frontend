import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],

  "addons": [
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],

  "framework": {
    "name": "@storybook/nextjs-vite",
    "options": {}
  },
};

export default config;