/*
 * Program: App.test.js
 *
 * Purpose: Contains the default React application smoke test used by the main
 *          app test suite.
 */

import { render, screen } from '@testing-library/react';
import App from './App';

/*
 * Test: renders learn react link
 *
 * Purpose: Verifies that the application renders the expected starter text.
 */
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
