/*
 * generateList
 * Create the initial list display and append it after the input element.
 * Returns a reference to the div wrapper and to the ul dropdown.
 * HTML Structure:
 * <div class='wrapper'>
 *  <ul></ul>
 * </div>
 */
export default function generateList() {
  let ul = document.createElement('ul');
  let div = document.createElement('div');

  div.classList.add('wrapper');
  div.appendChild(ul);

  return {wrapper: div, dropdown: ul};
}
