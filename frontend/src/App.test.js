import { render, screen } from '@testing-library/react';
import App from './App';

test('renders EcoTrack header', () => {
  render(<App />);
  const headerElement = screen.getByText(/EcoTrack/i);
  expect(headerElement).toBeInTheDocument();
});
