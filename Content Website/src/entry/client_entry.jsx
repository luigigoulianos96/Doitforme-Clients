import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { CLIENT, CLIENT_THEME } from '/src/pages/client/CLIENT.jsx';

// Bootstraps the client page React tree into #root.
// Backend integration: backend calls are handled inside page-level hooks.
export const mount_client_entry = () => {
  const rootNode = document.getElementById('root');
  const root = createRoot(rootNode);

  root.render(
    <ThemeProvider theme={CLIENT_THEME}>
      <CLIENT />
    </ThemeProvider>
  );
};

mount_client_entry();
