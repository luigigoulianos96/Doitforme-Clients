import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { ADMIN, ADMIN_THEME } from '/src/pages/admin/ADMIN.jsx';

// Bootstraps the admin page React tree into #root.
// Backend integration: backend calls are handled inside page-level hooks.
export const mount_admin_entry = () => {
  const rootNode = document.getElementById('root');
  const root = createRoot(rootNode);

  root.render(
    <ThemeProvider theme={ADMIN_THEME}>
      <ADMIN />
    </ThemeProvider>
  );
};

mount_admin_entry();
