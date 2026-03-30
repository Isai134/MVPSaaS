// Utility functions used across the application.
// Currently provides a simple className merge helper similar to the
// `cn` helper from the reference UI library.  This helper will
// concatenate class names, ignoring falsy values.

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
