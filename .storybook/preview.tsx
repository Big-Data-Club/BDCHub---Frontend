import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/app/globals.css";
import { handlers } from "../src/mocks/handlers";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "../src/store/UserContext";
import { ThemeProvider } from "next-themes";

// Initialize MSW
initialize({
  onUnhandledRequest: "bypass",
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: {
      handlers: handlers,
    },
    nextjs: {
      appDirectory: true,
    },
  },
  loaders: [mswLoader],
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story, context) => {
      const session = context.parameters.nextAuth?.session || null;
      return (
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="bdc-theme-storybook"
        >
          <UserProvider>
            <SessionProvider session={session}>
              <div className="antialiased">
                <Story />
              </div>
            </SessionProvider>
          </UserProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;