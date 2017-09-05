import debounce from './debounce.js';

export default function throttle(func, wait, immediate) {
  return debounce(func, wait, immediate);
}
