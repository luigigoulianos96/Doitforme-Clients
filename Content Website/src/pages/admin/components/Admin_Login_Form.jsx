import React from 'react';
import styled from 'styled-components';
import { Main_, Input_ } from '/node_modules/monica-alexandria/dist/index.mjs';

const Form = styled.form`
  display: grid;
  gap: 1rem;
  max-width: 48rem;
`;

// Renders admin sign-in form and emits submit with current credentials.
// Backend integration: submit should call Supabase auth.signInWithPassword.
export const Admin_Login_Form = ({ email, password, busy, onEmailChange, onPasswordChange, onSubmit }) => {
  return (
    <Form onSubmit={onSubmit}>
      <h3>Σύνδεση διαχείρισης</h3>
      <Input_ type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="Ηλεκτρονικό ταχυδρομείο" required />
      <Input_ type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="Κωδικός" required />
      <Main_ text={busy ? 'Περίμενε...' : 'Σύνδεση'} disabled={busy} />
    </Form>
  );
};
