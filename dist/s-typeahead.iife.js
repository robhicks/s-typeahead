var STypeahead = (function (exports,sUtilities) {
'use strict';

var css = "\n:host {\n  display: block;\n  box-sizing: border-box;\n  font-family: var(--font-family, arial);\n}\n\ninput {\n  box-sizing: border-box;\n  border: var(--border, 1px solid #ddd);\n  border-top-right-radius: var(--radius, 5px);\n  border-top-left-radius: var(--radius, 5px);\n  color: var(--input-text-color, #444);\n  font-size: var(--font-size, 13px);\n  outline: 0;\n  padding: var(--input-padding, 6px);\n  margin: 0;\n  width: 100%;\n}\n\n.wrapper {\n  position: relative;\n}\n\nul {\n  background: #fff;\n  margin: 0;\n  padding: 0;\n  position: absolute;\n  width: 100%;\n  z-index: 9999;\n}\n\nli {\n  border-bottom: var(--border, 1px solid #ddd);\n  border-left: var(--border, 1px solid #ddd);\n  border-right: var(--border, 1px solid #ddd);\n  color: var(--dropdown-text-color, #555);\n  font-family: var(--font-family, arial);\n  list-style-type: none;\n  padding: var(--dropdown-padding, 10px);\n}\n\nb {\n  color: var(--bold-color, blue);\n}\n\nli.highlight {\n  background-color: var(--highlight, rgb(228,240,255));\n  cursor: pointer;\n}\n\nli.hover {\n  background-color: var(--hover, rgb(228,240,244));\n  cursor: pointer;\n}\n\n";

/*
 * findMatches
 * term: a string to be matched against
 * items: the list of items to filter by this search term
 * Checks whether each string in a list contains the search term.
 * "Contains" means that the search term must be at the beginning of the string
 * or at the beginning of a word in the string (so after a space)
 */
function findMatches(term, items) {
  if ( items === void 0 ) items = [];

  if (term === "") { return []; }
  term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '');
  return items.sort().filter(function (item, i) { return new RegExp('^' + term, 'i').test(item); });
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
  var ul = document.createElement('ul');
  var div = document.createElement('div');

  div.classList.add('wrapper');
  div.appendChild(ul);

  return {wrapper: div, dropdown: ul};
}

var STypeahead = (function (HTMLElement) {
  function STypeahead() {
    HTMLElement.call(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = "<style>" + css + "</style><div><input /></div>";
    this.input = this.shadowRoot.querySelector('input');
    this.onKeyupHandlerBound = false;
    this.onBlurHandlerBound = false;
    this.activeClass = 'highlight';
    this.hoverClass = 'hover';
    this._options = {};
  }

  if ( HTMLElement ) STypeahead.__proto__ = HTMLElement;
  STypeahead.prototype = Object.create( HTMLElement && HTMLElement.prototype );
  STypeahead.prototype.constructor = STypeahead;

  var prototypeAccessors = { options: {} };
  var staticAccessors = { observedAttributes: {} };

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
 STypeahead.prototype.addItems = function addItems (items, dataObjects) {
   var this$1 = this;
   if ( items === void 0 ) items = [];

   var bs = '<b>';
   var be = '</b>';
   var fragment = document.createDocumentFragment();
   var li;

   items.forEach(function (item, i) {
     li = document.createElement('li');
     var idx = item.toLowerCase().indexOf(this$1.currentValue.toLowerCase());
     var len = this$1.currentValue.length;
     var str = idx !== -1 ? new sUtilities.StringBuilder(item).insert(idx, bs).insert(idx + len + 3, be).toString() : item;
     li.innerHTML = str;
     fragment.appendChild(li);
   });

   this.dropdown.appendChild(fragment.cloneNode(true));
   // setData checks whether dataObjects is undefined or not so no need to check here.
   // The items must be appended to the DOM first before the data can be set because the
   // property that the DataStore attaches to the DOM element is wiped out when the elements are appended.
   this.setData(dataObjects);

   this.bindItems();
 };

  STypeahead.prototype.attributeChangedCallback = function attributeChangedCallback (name, oVal, nVal) {
    var this$1 = this;

    if (nVal && !(/\{\{|_hyper/).test(nVal) && nVal !== '' && nVal !== oVal) {
      if (name === 'options' && this._options) {
        Object.assign(this._options, sUtilities.isJson(nVal) && nVal !== JSON.stringify(this._options) ? JSON.parse(nVal) : {});
        if (this._options.list && typeof this._options.list[0] === 'object') {
          if (!this._options.propertyInObjectArrayToUse) { throw new Error('propertyInObjectArrayToUse required if list contains objects'); }
          this._options.list = this._options.list.map(function (li) { return li[this$1._options.propertyInObjectArrayToUse]; });
        }
        if (this._options.initialValue && this.input) { this.input.value = this.options.initialValue; }
        if (this._options.placeholder && this.input) { this.input.placeholder = this._options.placeholder; }
        this.createDropdown();
      }
    }
  };

  /*
   * bindItems
   * Bind click and hover events to each list item.
   */
  STypeahead.prototype.bindItems = function bindItems () {
    var this$1 = this;

    var items = this.getDropdownItems();
    [].forEach.call(items, function (item, i) {
      this$1.registerEventListener(item, 'mousedown', this$1.triggerSelect.bind(this$1), this$1.clickHandlers);
      this$1.registerEventListener(item, 'mouseover', this$1.triggerHover.bind(this$1, i), this$1.hoverHandlers);
    });
  };

  /*
   * clearData
   * Empty the DataStore of all data corresponding to the current list items.
   */
  STypeahead.prototype.clearData = function clearData () {
    var this$1 = this;

    var items = this.getDropdownItems();
    [].forEach.call(items, function (item, i) {
      this$1.dataStore.remove(items[i]);
    });
  };

  /*
   * clearDropdown
   * Completely empty out the ul element.
   * Before removing all of the list items, all event listeners are unbound
   * and all corresponding data is cleared.
   */
  STypeahead.prototype.clearDropdown = function clearDropdown () {
    // Reset index back to -1
    this.setIndex();

    // Remove all event listeners
    this.unbindItems();

    // Clear data from the data store
    // this.clearData();

    // Completely remove all of the elements
    this.dropdown.innerHTML = '';
  };

  STypeahead.prototype.clearSearch = function clearSearch () {
    this.clearDropdown();
    this.input.value = '';
  };

  /*
   * createDropdown
   * Setup the initial dropdown.
   */
  STypeahead.prototype.createDropdown = function createDropdown () {
    var this$1 = this;

    this.input = this.shadowRoot.querySelector('input');
    if (!this.onKeyupHandlerBound) { this.input.onkeyup = this.onKeyupHandler.bind(this); }
    // this.input.onfocus = this.onFocusHandler.bind(this);
    if (!this.onBlurHandlerBound) { this.input.onblur = this.onBlurHandler.bind(this); }
    this.datastore = this.datastore || new sUtilities.DataStore();
    this.actionFunctions = this.actionFunctions || {
      // Enter key
      13: function () { return this$1.triggerSelect(this$1.getDropdownItems()[this$1.index], true); },
      // Escape key
      27: function () { return this$1.clearSearch(); },
      // Up arrow
      38: function () { return this$1.updateIndex(true); },
      // Down arrow
      40: function () { return this$1.updateIndex(); }
    };

    // This returns an object of {dropdown: DOM, wrapper: DOM}
    var list = generateList();

    // Grab the unordered list
    this.dropdown = list.dropdown;

    this.setIndex();

    // Hide the list
    this.hideDropdown();

    // Append it after the input
    sUtilities.appendAfter(this.input, list.wrapper);
  };

  STypeahead.prototype.connectedCallback = function connectedCallback () {

  };

  /*
   * deselectAllItems
   * Grabs all of the current list items and deactivates them.
   */
  STypeahead.prototype.deselectAllItems = function deselectAllItems () {
    var this$1 = this;

    var items = this.getDropdownItems();
    items.forEach(function (item) {
      sUtilities.removeClass(item, this$1.activeClass);
      sUtilities.removeClass(item, this$1.hoverClass);
    });
  };

  /*
   * deselectItems
   * items: a list of items to be deactivated.
   */
  STypeahead.prototype.deselectItems = function deselectItems (items) {
    var this$1 = this;
    if ( items === void 0 ) items = [];

    [].forEach.call(items, function (item, i) {
      sUtilities.removeClass(item, this$1.activeClass);
      sUtilities.removeClass(item, this$1.hoverClass);
    });
  };

  STypeahead.prototype.displayDropdown = function displayDropdown () {
    this.dropdown.style.display = 'block';
  };

  /*
   * getActionFromKey
   * ev: a keyup event
   * If the key is an action key (such as up arrow or enter), the function corresponding to this key is returned.
   * Returns undefined if the key pressed does not correspond to an action.
   */
  STypeahead.prototype.getActionFromKey = function getActionFromKey (ev) {
    if (!ev) { return; }
    var charCode = typeof ev.which === "number" ? ev.which : ev.keyCode;

    // Determine if this character is an action character
    var action = this.actionFunctions[charCode.toString()];
    if (action) { return action; }

    return;
  };

  STypeahead.prototype.getActiveItems = function getActiveItems () {
    return this.dropdown.getElementsByClassName(this.activeClass);
  };

  STypeahead.prototype.getDropdownItems = function getDropdownItems () {
    var dropdownItems = this.dropdown.querySelectorAll('li');
    return dropdownItems;
  };

  STypeahead.prototype.getHoverItems = function getHoverItems () {
    return this.dropdown.getElementsByClassName(this.hoverClass);
  };

  /*
   * getInputValue
   * Return the current input value.
   */
  STypeahead.prototype.getInputValue = function getInputValue () {
    return this.input.value;
  };

  /**
   * [Finds item in list and returns it]
   * @param  {[String]} val [Value to be found in list]
   * @param  {[Array]} list [HTMCollection of dropdown items]
   * @return {[String]}     [Item from the list or undefined if not found]
   */
  STypeahead.prototype.getItemFromList = function getItemFromList (val, list) {
    var this$1 = this;

    if (this._options.list) {
      var i = this._options.list.find(function (item) { return item.toLowerCase() === val.toLowerCase(); });
      return Promise.resolve(i ? i : '');
    }
    if (!this._makeRequest) { return; }
    return this._makeRequest(val).then(function (matches) {
      var match = matches.find(function (m) { return val === m[this$1._options.propertyInObjectArrayToUse]; });
      return match ? Promise.resolve(match[this$1._options.propertyInObjectArrayToUse]) : Promise.resolve(null);
    });
  };

  STypeahead.prototype.hideDropdown = function hideDropdown () {
    this.dropdown.style.display = 'none';
  };

  /*
   * onInputChange
   * When the value of the input field has changed make an AJAX request from the source
   * and update the dropdown with the returned values.
   */
  STypeahead.prototype.onInputChange = function onInputChange () {
    var this$1 = this;

    if (this._options.list) {
      // When searching from a static list, find the matches and update the dropdown with these matches
      var matches = findMatches(this.currentValue, this._options.list);
      this.updateDropdown(matches);
    } else {
      // Otherwise, hook up to a server call and update the dropdown with the matches
      if (!this._makeRequest) { return; }
      this._makeRequest(this.currentValue).then(function (matches) {
        matches = this$1._options.propertyInObjectArrayToUse ? matches.map(function (m) { return m[this$1._options.propertyInObjectArrayToUse]; }) : matches;
        this$1.updateDropdown(matches);
      });
    }
  };

  STypeahead.prototype.onBlurHandler = function onBlurHandler (e) {
    var this$1 = this;

    e.stopPropagation();
    setTimeout(function () {
      if (this$1.options.requireSelectionFromList) {
        this$1.getItemFromList(this$1.input.value)
          .then(function (itemFromList) {
            if (itemFromList) { this$1.input.value = itemFromList; }
            else { this$1.input.value = ''; }
          });
      }
      this$1.currentValue = this$1.input.value;
      this$1.clearDropdown();
    }, 10);
  };

  STypeahead.prototype.onKeyupHandler = function onKeyupHandler (e) {
    e.preventDefault();
    var value;
    var action = this.getActionFromKey(e);
    if (action) { action.call(this); }
    else {
      value = this.getInputValue();
      if (value !== this.currentValue) {
        this.currentValue = value;
        this.onInputChange.call(this);
      }
    }
  };

  /**
   * Takes a list of objects and returns a list containing one of the properties from the objects.
   * The property to be used within the list is set within this._options.property.
   * @param  {Array}  [matches=[]] [ a list of objects that need to be parsed for one property]
   * @return {[Array]}  [description]
   */
  STypeahead.prototype.parseMatches = function parseMatches (matches) {
    var this$1 = this;
    if ( matches === void 0 ) matches = [];

    return matches.map(function (match) { return match[this$1._options.property]; });
  };

  /**
   * [registerEventListener description]
   * @param  {[HTMLElement]} element [the element to add the event listener to]
   * @param  {[Event]} ev [the event to trigger (click, mouseover)]
   * @param  {[Function]} handler [the function handler]
   * @param  {[Array]} list [the list to add the function handler to for unbinding]
   * @return {[Void]} [description]
   */
  STypeahead.prototype.registerEventListener = function registerEventListener (element, ev, handler, list) {
      if (!element) { return; }
      element.addEventListener(ev, handler, false);
      list.push(handler);
  };

  /*
   * resetHandlers
   * Empty out event handlers.
   * Called when all items are unbound.
   */
  STypeahead.prototype.resetHandlers = function resetHandlers () {
      this.clickHandlers = [];
      this.hoverHandlers = [];
  };

  /*
   * setData
   * dataObjects: objects to be attached to a DOM element.
   * Stores the passed in objects onto the dropdown list items.
   * Uses the DataStore functionality provided in DataStore.js.
   */
  STypeahead.prototype.setData = function setData (dataObjects) {
    if (!dataObjects || dataObjects.length === 0) { return; }

    var items = this.getDropdownItems();
    items.forEach(function (item, i) {
      dataStore.set(item, 'data', dataObjects[i]);
    });
  };

  /*
   * selectItem
   * index: the index of the item to set as active or inactive
   * deselect: a boolean of whether to set the item as active or inactive
   */
  STypeahead.prototype.selectItem = function selectItem (index, deselect) {
    var items = this.getDropdownItems();

    if (items.length > 0 && items[index]) {
      if (deselect) { sUtilities.removeClass(items[index], this.activeClass); }
      else { sUtilities.addClass(items[index], this.activeClass); }
    }
  };

  /*
   * setIndex
   * idx: the value to change the index to
   * Sets the index to a value without altering on list items.
   * If no index is passed in then the index is reset back to -1.
   * If an out of bounds index is passed then nothing is changed.
   */
  STypeahead.prototype.setIndex = function setIndex (idx) {
    // Make sure we stay within bounds again
    if (idx < -1 || idx > this.getDropdownItems().length - 1) { return; }
    this.index = idx || idx === 0 ? idx : -1;
  };

  /*
   * triggerHover
   * Perform default mouseover behavior: element that the event is triggered on is activated
   * and all other active elements are deactived.
   * Call the optional onHover function after.
   */
  STypeahead.prototype.triggerHover = function triggerHover (index, evt) {
    var item = evt.target;
    this.deselectItems(this.getHoverItems());
    sUtilities.addClass(item, this.hoverClass);

    this.setIndex(index);
    if (typeof this._options.onHover === 'function') {
      var data = dataStore.get(item, 'data');
      this._options.onHover(item, data);
    }
  };

  /*
   * triggerSelect
   * Perform default click behavior: element that the event is triggered on is activated
   * and all other active elements are deactivated.
   * Call the optional onSelect function after.
   */
  STypeahead.prototype.triggerSelect = function triggerSelect (ev, clearDropdown) {
    var this$1 = this;
    if ( clearDropdown === void 0 ) clearDropdown = false;

    var item;
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
      sUtilities.removeClass(item, this.hoverClass);
      sUtilities.addClass(item, this.activeClass);
    } else if (this.options.requireSelectionFromList) {
      this.getItemFromList(this.currentValue)
        .then(function (listItem) {
          if (listItem) { this$1.input.value = listItem; }
        });
    }
    this.deselectItems(this.getDropdownItems());
    document.dispatchEvent(new CustomEvent('EVENT:s-typeahead:selectionChangedEvent', {detail: {id: this._options.uid, value: this.input.value}}));
    if (clearDropdown) { this.clearDropdown(); }
  };

  /*
   * updateIndex
   * decrement: boolean of whether to increment or decrement the index
   * Updates the index and activates the list item for that updated index.
   */
  STypeahead.prototype.updateIndex = function updateIndex (decrement) {
      // Make sure we stay within bounds
    var length = this.getDropdownItems().length - 1;
    if (decrement && this.index === 0) { return; }
    if (!decrement && this.index === length) { return; }

    // TODO: Is this really going to be faster than doing deselectAllItems? where we just remove it
    // from the items we have saved?
    // Would be interesting to see if the document.getElementsByClassName makes
    // it slower
    this.deselectItems(this.getActiveItems());

    if (decrement) { this.index--; }
    else { this.index++; }

    this.selectItem(this.index);
  };

  /*
   * unbindItems
   * Unbind all events from all list items
   */
  STypeahead.prototype.unbindItems = function unbindItems () {
    var this$1 = this;

    var items = this.getDropdownItems();
    [].forEach.call(items, function (item, i) {
      items[i].removeEventListener('click', this$1.clickHandlers[i], false);
      items[i].removeEventListener('mouseover', this$1.hoverHandlers[i], false);
    });
    this.resetHandlers();
  };

  /**
   * [updateDropdown mpties out the dropdown and appends a new set of list items if they exist.]
   * @param  {[Array]} labels       [strings to be displayed within the list items of the dropdown]
   * @param  {[Array]} dataObjects  [objects to be stored within the list items]
   * @return {[Void]}               [nothing]
   */
  STypeahead.prototype.updateDropdown = function updateDropdown (labels, dataObjects) {
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
  };

  prototypeAccessors.options.get = function () {
    return this._options;
  };

  prototypeAccessors.options.set = function (options) {
    if (typeof options.makeRequest === 'function') { this._makeRequest = options.makeRequest; }
    if (typeof options === 'object') { this.setAttribute('options', JSON.stringify(options)); }
    else { this.setAttribute('options', options); }
  };

  staticAccessors.observedAttributes.get = function () {
    return ['options'];
  };

  Object.defineProperties( STypeahead.prototype, prototypeAccessors );
  Object.defineProperties( STypeahead, staticAccessors );

  return STypeahead;
}(HTMLElement));

customElements.define('s-typeahead', STypeahead);

exports.STypeahead = STypeahead;

return exports;

}({},SUtilities));
