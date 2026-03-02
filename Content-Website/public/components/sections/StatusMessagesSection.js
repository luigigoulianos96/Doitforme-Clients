import React from 'react';
import { State } from '../../core/styles/App.styles.js';

function StatusMessagesSection({ status, copy }) {
  return React.createElement(
    React.Fragment,
    null,
    status.loading ? React.createElement(State, null, copy.loadingPreview) : null,
    status.error ? React.createElement(State, { $error: true }, `${copy.errorPrefix}: `, status.error) : null,
    status.message ? React.createElement(State, null, status.message) : null
  );
}

export { StatusMessagesSection };
