import '@testing-library/jest-dom';

// Extend the Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveStyle(style: string | Record<string, unknown>): R;
    }
  }
}
