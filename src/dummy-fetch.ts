export default function fetch() {
  if (typeof window !== 'undefined') {
    return window.fetch.apply(window, arguments);
  }
  throw new Error('fetch not available');
}
