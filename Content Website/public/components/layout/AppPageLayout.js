import React from 'react';
import { AppStyle, Page } from '../../core/styles/App.styles.js';

function AppPageLayout({ children }) {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(AppStyle, null),
    React.createElement(Page, null, children)
  );
}

export { AppPageLayout };
