export default function isInViewport(element) {
  let rect = element.getBoundingClientRect();
  let html = document.documentElement;
  let fudge = 500;
  return (
    rect.top >= 0 - rect.height - fudge &&
    rect.left >= 0 - rect.width - fudge &&
    rect.bottom <= html.clientHeight + rect.height + fudge &&
    rect.right <= html.clientWidth + fudge
  );
}
