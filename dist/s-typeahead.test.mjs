import { DataStore, StringBuilder, addClass, appendAfter, isJson, removeClass } from 's-utilities';

var css = `
:host {
  display: block;
  box-sizing: border-box;
  font-family: var(--font-family, arial);
}

input {
  box-sizing: border-box;
  border: var(--border, 1px solid #ddd);
  border-top-right-radius: var(--radius, 5px);
  border-top-left-radius: var(--radius, 5px);
  color: var(--input-text-color, #444);
  font-size: var(--font-size, 13px);
  outline: 0;
  padding: var(--input-padding, 6px);
  margin: 0;
  width: 100%;
}

.wrapper {
  position: relative;
}

ul {
  background: #fff;
  margin: 0;
  padding: 0;
  position: absolute;
  width: 100%;
  z-index: 9999;
}

li {
  border-bottom: var(--border, 1px solid #ddd);
  border-left: var(--border, 1px solid #ddd);
  border-right: var(--border, 1px solid #ddd);
  color: var(--dropdown-text-color, #555);
  font-family: var(--font-family, arial);
  list-style-type: none;
  padding: var(--dropdown-padding, 10px);
}

b {
  color: var(--bold-color, blue);
}

li.highlight {
  background-color: var(--highlight, rgb(228,240,255));
  cursor: pointer;
}

li.hover {
  background-color: var(--hover, rgb(228,240,244));
  cursor: pointer;
}

`;

/*
 * findMatches
 * term: a string to be matched against
 * items: the list of items to filter by this search term
 * Checks whether each string in a list contains the search term.
 * "Contains" means that the search term must be at the beginning of the string
 * or at the beginning of a word in the string (so after a space)
 */
function findMatches(term, items = []) {
  if (term === "") return [];
  term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '');
  return items.sort().filter((item, i) => new RegExp('^' + term, 'i').test(item));
  // return items.sort().map((item, i) => item.match(new RegExp('\\b' + term, 'gi')));
}

/*
 * generateList
 * Create the initial list display and append it after the input element.
 * Returns a reference to the div wrapper and to the ul dropdown.
 * HTML Structure:
 * <div class='wrapper'>
 *  <ul></ul>
 * </div>
 */
function generateList() {
  let ul = document.createElement('ul');
  let div = document.createElement('div');

  div.classList.add('wrapper');
  div.appendChild(ul);

  return {wrapper: div, dropdown: ul};
}

class STypeahead extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `<style>${css}</style><div><input /></div>`;
    this.input = this.shadowRoot.querySelector('input');
    this.onKeyupHandlerBound = false;
    this.onBlurHandlerBound = false;
    this.activeClass = 'highlight';
    this.hoverClass = 'hover';
    this._options = {};
  }

/**
 * Creates <li>s for each item in the items list and once they have all
 * been added to a document fragment, appends them to the dropdown.
 * Once the items have been appended to the DOM, the DataStore is updated
 * with the corresponding dataObjects. Lastly, event listeners are added
 * to each of the items.
 * @param {Array}  [items=[]]  [a list of strings]
 * @param {[type]} dataObjects [a list of objects corresponding to the labels]
 * @returns {[Void]} []
 */
 addItems(items = [], dataObjects) {
   let bs = '<b>';
   let be = '</b>';
   let fragment = document.createDocumentFragment();
   let li;

   items.forEach((item, i) => {
     li = document.createElement('li');
     let idx = item.toLowerCase().indexOf(this.currentValue.toLowerCase());
     let len = this.currentValue.length;
     let str = idx !== -1 ? new StringBuilder(item).insert(idx, bs).insert(idx + len + 3, be).toString() : item;
     li.innerHTML = str;
     fragment.appendChild(li);
   });

   this.dropdown.appendChild(fragment.cloneNode(true));
   // setData checks whether dataObjects is undefined or not so no need to check here.
   // The items must be appended to the DOM first before the data can be set because the
   // property that the DataStore attaches to the DOM element is wiped out when the elements are appended.
   this.setData(dataObjects);

   this.bindItems();
 }

  attributeChangedCallback(name, oVal, nVal) {
    if (nVal && !(/\{\{|_hyper/).test(nVal) && nVal !== '' && nVal !== oVal) {
      if (name === 'options' && this._options) {
        Object.assign(this._options, isJson(nVal) && nVal !== JSON.stringify(this._options) ? JSON.parse(nVal) : {});
        if (this._options.list && typeof this._options.list[0] === 'object') {
          if (!this._options.propertyInObjectArrayToUse) throw new Error('propertyInObjectArrayToUse required if list contains objects');
          this._options.list = this._options.list.map((li) => li[this._options.propertyInObjectArrayToUse]);
        }
        if (this._options.initialValue && this.input) this.input.value = this.options.initialValue;
        if (this._options.placeholder && this.input) this.input.placeholder = this._options.placeholder;
        this.createDropdown();
      }
    }
  }

  /*
   * bindItems
   * Bind click and hover events to each list item.
   */
  bindItems() {
    let items = this.getDropdownItems();
    [].forEach.call(items, (item, i) => {
      this.registerEventListener(item, 'mousedown', this.triggerSelect.bind(this), this.clickHandlers);
      this.registerEventListener(item, 'mouseover', this.triggerHover.bind(this, i), this.hoverHandlers);
    });
  }

  /*
   * clearData
   * Empty the DataStore of all data corresponding to the current list items.
   */
  clearData() {
    let items = this.getDropdownItems();
    [].forEach.call(items, (item, i) => {
      this.dataStore.remove(items[i]);
    });
  }

  /*
   * clearDropdown
   * Completely empty out the ul element.
   * Before removing all of the list items, all event listeners are unbound
   * and all corresponding data is cleared.
   */
  clearDropdown() {
    // Reset index back to -1
    this.setIndex();

    // Remove all event listeners
    this.unbindItems();

    // Clear data from the data store
    // this.clearData();

    // Completely remove all of the elements
    this.dropdown.innerHTML = '';
  }

  clearSearch() {
    this.clearDropdown();
    this.input.value = '';
  }

  /*
   * createDropdown
   * Setup the initial dropdown.
   */
  createDropdown() {
    this.input = this.shadowRoot.querySelector('input');
    if (!this.onKeyupHandlerBound) this.input.onkeyup = this.onKeyupHandler.bind(this);
    // this.input.onfocus = this.onFocusHandler.bind(this);
    if (!this.onBlurHandlerBound) this.input.onblur = this.onBlurHandler.bind(this);
    this.datastore = this.datastore || new DataStore();
    this.actionFunctions = this.actionFunctions || {
      // Enter key
      13: () => this.triggerSelect(this.getDropdownItems()[this.index], true),
      // Escape key
      27: () => this.clearSearch(),
      // Up arrow
      38: () => this.updateIndex(true),
      // Down arrow
      40: () => this.updateIndex()
    };

    // This returns an object of {dropdown: DOM, wrapper: DOM}
    let list = generateList();

    // Grab the unordered list
    this.dropdown = list.dropdown;

    this.setIndex();

    // Hide the list
    this.hideDropdown();

    // Append it after the input
    appendAfter(this.input, list.wrapper);
  }

  connectedCallback() {

  }

  /*
   * deselectAllItems
   * Grabs all of the current list items and deactivates them.
   */
  deselectAllItems() {
    let items = this.getDropdownItems();
    items.forEach((item) => {
      removeClass(item, this.activeClass);
      removeClass(item, this.hoverClass);
    });
  }

  /*
   * deselectItems
   * items: a list of items to be deactivated.
   */
  deselectItems(items = []) {
    [].forEach.call(items, (item, i) => {
      removeClass(item, this.activeClass);
      removeClass(item, this.hoverClass);
    });
  }

  displayDropdown() {
    this.dropdown.style.display = 'block';
  }

  /*
   * getActionFromKey
   * ev: a keyup event
   * If the key is an action key (such as up arrow or enter), the function corresponding to this key is returned.
   * Returns undefined if the key pressed does not correspond to an action.
   */
  getActionFromKey(ev) {
    if (!ev) return;
    let charCode = typeof ev.which === "number" ? ev.which : ev.keyCode;

    // Determine if this character is an action character
    let action = this.actionFunctions[charCode.toString()];
    if (action) return action;

    return;
  }

  getActiveItems() {
    return this.dropdown.getElementsByClassName(this.activeClass);
  }

  getDropdownItems() {
    let dropdownItems = this.dropdown.querySelectorAll('li');
    return dropdownItems;
  }

  getHoverItems() {
    return this.dropdown.getElementsByClassName(this.hoverClass);
  }

  /*
   * getInputValue
   * Return the current input value.
   */
  getInputValue() {
    return this.input.value;
  }

  /**
   * [Finds item in list and returns it]
   * @param  {[String]} val [Value to be found in list]
   * @param  {[Array]} list [HTMCollection of dropdown items]
   * @return {[String]}     [Item from the list or undefined if not found]
   */
  getItemFromList(val, list) {
    if (this._options.list) {
      let i = this._options.list.find((item) => item.toLowerCase() === val.toLowerCase());
      return Promise.resolve(i ? i : '');
    }
    if (!this._makeRequest) return;
    return this._makeRequest(val).then(matches => {
      let match = matches.find((m) => val === m[this._options.propertyInObjectArrayToUse]);
      return match ? Promise.resolve(match[this._options.propertyInObjectArrayToUse]) : Promise.resolve(null);
    });
  }

  hideDropdown() {
    this.dropdown.style.display = 'none';
  }

  /*
   * onInputChange
   * When the value of the input field has changed make an AJAX request from the source
   * and update the dropdown with the returned values.
   */
  onInputChange() {
    if (this._options.list) {
      // When searching from a static list, find the matches and update the dropdown with these matches
      let matches = findMatches(this.currentValue, this._options.list);
      this.updateDropdown(matches);
    } else {
      // Otherwise, hook up to a server call and update the dropdown with the matches
      if (!this._makeRequest) return;
      this._makeRequest(this.currentValue).then(matches => {
        matches = this._options.propertyInObjectArrayToUse ? matches.map((m) => m[this._options.propertyInObjectArrayToUse]) : matches;
        this.updateDropdown(matches);
      });
    }
  }

  onBlurHandler(e) {
    e.stopPropagation();
    setTimeout(() => {
      if (this.options.requireSelectionFromList) {
        this.getItemFromList(this.input.value)
          .then((itemFromList) => {
            if (itemFromList) this.input.value = itemFromList;
            else this.input.value = '';
          });
      }
      this.currentValue = this.input.value;
      this.clearDropdown();
    }, 10);
  }

  onKeyupHandler(e) {
    e.preventDefault();
    let value;
    let action = this.getActionFromKey(e);
    if (action) action.call(this);
    else {
      value = this.getInputValue();
      if (value !== this.currentValue) {
        this.currentValue = value;
        this.onInputChange.call(this);
      }
    }
  }

  /**
   * Takes a list of objects and returns a list containing one of the properties from the objects.
   * The property to be used within the list is set within this._options.property.
   * @param  {Array}  [matches=[]] [ a list of objects that need to be parsed for one property]
   * @return {[Array]}  [description]
   */
  parseMatches(matches = []) {
    return matches.map((match) => match[this._options.property]);
  }

  /**
   * [registerEventListener description]
   * @param  {[HTMLElement]} element [the element to add the event listener to]
   * @param  {[Event]} ev [the event to trigger (click, mouseover)]
   * @param  {[Function]} handler [the function handler]
   * @param  {[Array]} list [the list to add the function handler to for unbinding]
   * @return {[Void]} [description]
   */
  registerEventListener(element, ev, handler, list) {
      if (!element) return;
      element.addEventListener(ev, handler, false);
      list.push(handler);
  }

  /*
   * resetHandlers
   * Empty out event handlers.
   * Called when all items are unbound.
   */
  resetHandlers() {
      this.clickHandlers = [];
      this.hoverHandlers = [];
  }

  /*
   * setData
   * dataObjects: objects to be attached to a DOM element.
   * Stores the passed in objects onto the dropdown list items.
   * Uses the DataStore functionality provided in DataStore.js.
   */
  setData(dataObjects) {
    if (!dataObjects || dataObjects.length === 0) return;

    let items = this.getDropdownItems();
    items.forEach((item, i) => {
      dataStore.set(item, 'data', dataObjects[i]);
    });
  }

  /*
   * selectItem
   * index: the index of the item to set as active or inactive
   * deselect: a boolean of whether to set the item as active or inactive
   */
  selectItem(index, deselect) {
    let items = this.getDropdownItems();

    if (items.length > 0 && items[index]) {
      if (deselect) removeClass(items[index], this.activeClass);
      else addClass(items[index], this.activeClass);
    }
  }

  /*
   * setIndex
   * idx: the value to change the index to
   * Sets the index to a value without altering on list items.
   * If no index is passed in then the index is reset back to -1.
   * If an out of bounds index is passed then nothing is changed.
   */
  setIndex(idx) {
    // Make sure we stay within bounds again
    if (idx < -1 || idx > this.getDropdownItems().length - 1) return;
    this.index = idx || idx === 0 ? idx : -1;
  }

  /*
   * triggerHover
   * Perform default mouseover behavior: element that the event is triggered on is activated
   * and all other active elements are deactived.
   * Call the optional onHover function after.
   */
  triggerHover(index, evt) {
    let item = evt.target;
    this.deselectItems(this.getHoverItems());
    addClass(item, this.hoverClass);

    this.setIndex(index);
    if (typeof this._options.onHover === 'function') {
      let data = dataStore.get(item, 'data');
      this._options.onHover(item, data);
    }
  }

  /*
   * triggerSelect
   * Perform default click behavior: element that the event is triggered on is activated
   * and all other active elements are deactivated.
   * Call the optional onSelect function after.
   */
  triggerSelect(ev, clearDropdown = false) {
    let item;
    if (ev) {
      if (ev.target) {
        ev.stopPropagation();
        item = ev.target;
      } else {
        item = ev;
      }
    }

    if (item) {
      this.input.value = item.textContent;
      removeClass(item, this.hoverClass);
      addClass(item, this.activeClass);
    } else if (this.options.requireSelectionFromList) {
      this.getItemFromList(this.currentValue)
        .then((listItem) => {
          if (listItem) this.input.value = listItem;
        });
    }
    this.deselectItems(this.getDropdownItems());
    document.dispatchEvent(new CustomEvent(`EVENT:s-typeahead:selectionChangedEvent${this._options.uid}`, {detail: {id: this._options.uid, value: this.input.value}}));
    if (clearDropdown) this.clearDropdown();
  }

  /*
   * updateIndex
   * decrement: boolean of whether to increment or decrement the index
   * Updates the index and activates the list item for that updated index.
   */
  updateIndex(decrement) {
      // Make sure we stay within bounds
    let length = this.getDropdownItems().length - 1;
    if (decrement && this.index === 0) return;
    if (!decrement && this.index === length) return;

    // TODO: Is this really going to be faster than doing deselectAllItems? where we just remove it
    // from the items we have saved?
    // Would be interesting to see if the document.getElementsByClassName makes
    // it slower
    this.deselectItems(this.getActiveItems());

    if (decrement) this.index--;
    else this.index++;

    this.selectItem(this.index);
  }

  /*
   * unbindItems
   * Unbind all events from all list items
   */
  unbindItems() {
    let items = this.getDropdownItems();
    [].forEach.call(items, (item, i) => {
      items[i].removeEventListener('click', this.clickHandlers[i], false);
      items[i].removeEventListener('mouseover', this.hoverHandlers[i], false);
    });
    this.resetHandlers();
  }

  /**
   * [updateDropdown mpties out the dropdown and appends a new set of list items if they exist.]
   * @param  {[Array]} labels       [strings to be displayed within the list items of the dropdown]
   * @param  {[Array]} dataObjects  [objects to be stored within the list items]
   * @return {[Void]}               [nothing]
   */
  updateDropdown(labels, dataObjects) {
      // Always clear the dropdown with a new search
      this.clearDropdown();

      // No matches returned, hide the dropdown
      if (labels.length === 0) {
          this.hideDropdown();
          return;
      }

      // Matches returned, add the matches to the list
      // and display the dropdown
      this.addItems(labels, dataObjects);
      this.displayDropdown();
  }

  get options() {
    return this._options;
  }

  set options(options) {
    if (typeof options.makeRequest === 'function') this._makeRequest = options.makeRequest;
    if (typeof options === 'object') this.setAttribute('options', JSON.stringify(options));
    else this.setAttribute('options', options);
  }

  static get observedAttributes() {
    return ['options'];
  }
}

customElements.define('s-typeahead', STypeahead);

export { STypeahead };
