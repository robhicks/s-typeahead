function hasClass(el, name) {
  return el.className.match(new RegExp("(\\s|^)" + name + "(\\s|$)")) === null ? false : true;
}

function addClass(el, name) {
  if (!hasClass(el, name)) {
    el.className += (el.className ? ' ' : '') + name;
  }
}

function removeClass(el, name) {
  if (hasClass(el, name)) {
    el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
  }
}

function appendAfter(el, sibling) {
  if (el.nextSibling) {
      el.parentNode.insertBefore(sibling, el.nextSibling);
      return;
  }

  el.parentNode.appendChild(sibling);
}

var css = `
:host {
  display: block;
  box-sizing: border-box;
  font-family: var(--font-family, arial);
}

input {
  box-sizing: border-box;
  border: var(--border, 1px solid #ddd);
  border-top-right-radius: var(--radius, 3px);
  border-top-left-radius: var(--radius, 3px);
  color: var(--input-text-color, #444);
  font-size: var(--font-size, 20px);
  outline: 0;
  padding: var(--input-padding, 10px);
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

class DataStore {
  constructor() {
    this.storeMap = {};
  }

  // this.get(el, "hi");
  get(element, key) {
    return this.getStore(element)[key] || null;
  }

  getAll() {
    console.log("this.storeMap", this.storeMap);
  }

  // this.set(el, "hi", {"number": 4}
  set(element, key, value) {
    if (!value) return;
    this.getStore(element)[key] = value;
    return value;
  }

  // this.remove(el);
  // this.remove(el, "hi");
  remove(element, key) {
    if (key) {
      let store = this.getStore(element);
      if (store[key]) delete store[key];
    } else {
      let elementId = element[this.storeId];
      if (elementId) {
        delete this.storeMap[elementId];
        delete element[this.storeId];
      }
    }
  }

  getStore(element) {
    let storeId = this.storeId;
    let storeMap = this.storeMap;
    let elementId = element[storeId];

    if (!elementId) {
      elementId = element[storeId] = this.uid++;
      storeMap[elementId] = {};
    }

    return storeMap[elementId];
  }
}

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

function isJson(str) {
  try {
    let json = JSON.parse(str);
    return json;
  } catch (e) {
    return false;
  }
}

/**
 * Class to manage URL paths
 */
class Path {
  /**
   * @param {string} f - string path
   * @param {object} ctx - context of Uri class
   */
  constructor(f, ctx = {}) {
    this.ctx = ctx;
    this._path = [];
    return this.parse(f);
  }

  /**
   * Append to a path
   * @param {string} s path to append
   * @return {instance} for chaining
   */
  append(s) {
    this._path.push(s);
    return this.ctx;
  }

  /**
   * Delete end of path
   * @param {integer} loc - segment of path to delete
   * @return {instance} for chaining
   */
  delete(loc) {
    if (!loc) {
      this._path.pop();
      return this.ctx;
    }
  }

  /**
   * Get the path
   * @return {array} path as array
   */
  get() {
    return this._path;
  }

  /**
   * Parse the path part of a URl
   * @param {string} f - string path
   * @return {instance} for chaining
   */
  parse(f = '') {
    let path = decodeURIComponent(f);
    let split = path.split('/');
    if (Array.isArray(split)) {
      if(path.match(/^\//)) split.shift();
      if (split.length > 1 && path.match(/\/$/)) split.pop();
      this._path = split;
    }
    return this;
  }

  /**
   * Replace part of a path
   * @param {string} f - path replacement
   * @param {integer} loc - location to replace
   * @return {instance} for chaining
   */
  replace(f, loc) {
    if (loc === 'file') {
      this._path.splice(this._path.length - 1, 1, f);
      return this.ctx;
    } else if (Number.isInteger(loc)) {
      this._path.splice(loc, 1, f);
      return this.ctx;
    }
    this.parse(f);
    return this.ctx;
  }

  /**
   * Get string representatio of the path or the uri
   * @param {boolen} uri - if true return string represention of uri
   * @return {string} path or uri as string
   */
  toString(uri) {
    if (uri) return this.ctx.toString();
    return Array.isArray(this._path) ? this._path.join('/') : '';
  }
}

/**
 * Class to manage query part of URL
 */
class Query {
  /**
   * @param {string} f - query string
   * @param {object} ctx - context of uri instance
   * @return {instance} for chaining
   */
  constructor(f, ctx = {}) {
    Object.assign(this, ctx);
    this.ctx = ctx;
    this.set(f);
    return this;
  }

  /**
   * Add a query string
   * @param {object} obj {name: 'value'}
   * @return {instance} for chaining
   */
  add(obj = {}) {
    this._query = this._convert(obj, this._query[0], this._query[1]);
    return this.ctx;
  }

  /**
   * Remove the query string
   * @return {instance} for chaining
   */
  clear() {
    this._query = [[], []];
    return this.ctx;
  }

  _convert(obj, p = [], q = []) {
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        for (let i = 0; i < obj[key].length; i++) {
          let val = obj[key][i];
          p.push(key);
          q.push(val);
        }
      } else if(obj[key]) {
        p.push(key);
        q.push(obj[key]);
      }
    }
    return [p, q];
  }

  /**
   * Get the query string
   * @return {array} representing the query string
   */
  get() {
    let dict = {};
    let obj = this._query;

    for (let i = 0; i < obj[0].length; i++) {
      let k = obj[0][i];
      let v = obj[1][i];
      if (dict[k]) {
        dict[k].push(v);
      } else {
        dict[k] = [v];
      }
    }
    return dict;
  }

  getUrlTemplateQuery() {
    return this._urlTemplateQueryString;
  }

  /**
   * Merge with the query string - replaces query string values if they exist
   * @param {object} obj {name: 'value'}
   * @return {instance} for chaining
   */
  merge(obj) {
    let p = this._query[0];
    let q = this._query[1];
    for (let key in obj) {
      let kset = false;

      for(let i=0; i < p.length; i++) {
        let xKey = p[i];
        if(key === xKey) {
          if(kset) {
            p.splice(i,1);
            q.splice(i,1);
            continue;
          }
          if (Array.isArray(obj[key])) {
            q[i] = obj[key].shift();
          } else if (typeof obj[key] === 'undefined' || obj[key] === null) {
            p.splice(i, 1);
            q.splice(i, 1);
            delete obj[key];
          } else {
            q[i] = obj[key];
            delete obj[key];
          }
          kset = true;
        }
      }
    }
    this._query = this._convert(obj, this._query[0], this._query[1]);
    return this.ctx;
  }

  _parse(q = '') {
    let struct = [[], []];
    let pairs = q.split(/&|;/);

    for (let j = 0; j < pairs.length; j++) {
      let name, value, pair = pairs[j], nPair = pair.match(this.qRegEx);

      if(nPair && typeof nPair[nPair.length -1] !== 'undefined') {
        nPair.shift();
        for (let i = 0; i < nPair.length; i++) {
          let p = nPair[i];
          struct[i].push(decodeURIComponent(p.replace('+', ' ', 'g')));
        }
      }
    }
    return struct;
  }

  /**
   * Set with the query string - replaces existing query string
   * @param {obj} or {string} ...q
   * @return {instance} for chaining
   */
  set(...q) {
    let args = [...q];

    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        this._query = this._convert(args[0]);
      } else {
        this._query = this._parse(args[0]);
      }
    } else if (args.length === 0) {
      this.clear();
    } else {
      let obj = {};
      obj[args[0]] = args[1];
      this.merge(obj);
    }
    return this.ctx;
  }

  /**
   * Set the url template query string vale
   * @param {string} url-template query string
   * @return {instance} for chaining
   */
  setUrlTemplateQuery(s) {
    this._urlTemplateQueryString = s;
  }

  /**
   * Get string representatio of the path or the uri
   * @param {boolen} uri - if true return string represention of uri
   * @return {string} query or uri as string
   */
  toString(uri) {
    if (uri) return this.ctx.toString();
    let pairs = [];
    let n = this._query[0];
    let v = this._query[1];

    for(let i = 0; i < n.length; i++) {
      pairs.push(encodeURIComponent(n[i]) + '=' + encodeURIComponent(v[i]));
    }
    return pairs.join('&');
   }
}

/**
 * Class to make it easier to build strings
 */
class StringBuilder {
  /**
   * @param {string} string - starting string (optional)
   * @return {instance} for chaining
   */
  constructor(string) {
    if (!string || typeof string === 'undefined') this.string = String("");
    else this.string = String(string);
  }

  /**
   * Return full string
   * @return {string} assembled string
   */
  toString() {
    return this.string;
  }

  /**
   * Append a string to an existing string
   * @param {string} val - string to be appended
   * @return {instance} for chaining
   */
  append(val) {
    this.string += val;
    return this;
  }

  /**
   * Insert a string to an existing string
   * @param {integer} pos - position at which to insert value
   * @param {string} val - string to be inserted
   * @return {instance} for chaining
   */
  insert(pos, val) {
    let left = this.string.slice(0, pos);
    let right = this.string.slice(pos);
    this.string = left + val + right;
    return this;
  }

}

/**
 * Uri - manipulate URLs
 */
class TinyUri {
  /**
   * @param {string} uri - a URI string
   * @return {instance} - return Uri instance for chaining
   */
  constructor(uri) {
    this.uriRegEx = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
    this.authRegEx = /^([^\@]+)\@/;
    this.portRegEx = /:(\d+)$/;
    this.qRegEx = /^([^=]+)(?:=(.*))?$/;
    this.urlTempQueryRegEx = /\{\?(.*?)\}/;
    return this.parse(uri);
  }

  /**
   * @param {string} authority - username password part of URL
   * @return {instance} - returns Uri instance for chaining
   */
  authority(authority = '') {
    if (authority !== '') {
      let auth = authority.match(this.authRegEx);
      this._authority = authority;
      if (auth) {
        authority = authority.replace(this.authRegEx, '');
        this.userInfo(auth[1]);
      }
      let port = authority.match(this.portRegEx);
      if(port) {
        authority = authority.replace(this.portRegEx, '');
        this.port(port[1]);
      }
      this.host(authority.replace('{', ''));
      return this;
    } else {
      let userinfo = this.userInfo();
      if (userinfo) authority = userinfo + '@';
      authority += this.host();
      let port = this.port();
      if (port) authority += ':' + port;
      return authority;
    }
  }

  /**
   * @param {string} f - string representation of fragment
   * @return {instance} - returns Uri instance for chaining
   */
  fragment(f = '') {
    return this.gs(f, '_fragment');
  }

  gs(val, tar, fn) {
    if (typeof val !== 'undefined') {
      this[tar] = val;
      return this;
    }
    return fn ? fn(this[tar]) : this[tar] ? this[tar] : '';
  }

  /**
   * @param {string} f - string representation of host
   * @return {instance} - returns Uri instance for chaining
   */
  host(f) {
    return this.gs(f, '_host');
  }

  /**
   * @param {string} uri - URL
   * @return {instance} - returns Uri instance for chaining
   */
  parse(uri) {
    let f = uri ? uri.match(this.uriRegEx) : [];
    let t = uri ? uri.match(this.urlTempQueryRegEx) : [];
    this.scheme(f[2]);
    this.authority(f[4]);
    this.path = new Path(f[5].replace(/{$/, ''), this);
    this.fragment(f[9]);
    this.query = new Query(f[7], this);
    if (t) this.query.setUrlTemplateQuery(t[1]);
    return this;
  }

  /**
   * @param {string} f - port part of URL
   * @return {instance} - returns Uri instance for chaining
   */
  port(f) {
    return this.gs(f, '_port');
  }

  /**
   * @param {string} f - protocol part of URL
   * @return {instance} - returns Uri instance for chaining
   */
  protocol(f) {
    return this.scheme.toLowerCase();
  }

  /**
   * @param {string} f - protocol scheme
   * @return {instance} - returns Uri instance for chaining
   */
  scheme(f) {
    return this.gs(f, '_scheme');
  }

  /**
   * @param {string} f - user info part of URL
   * @return {instance} - returns Uri instance for chaining
   */
  userInfo(f) {
    return this.gs(f, '_userinfo', (r) => {
      return r ? encodeURI(r) : r;
    });
  }

  /**
   * @return {string} - returns string URL
   */
  toString() {
    let q = this.query.toString();
    let p = this.path.toString();
    let f = this.fragment();
    let s = this.scheme();
    let str = new StringBuilder();
    let retStr = str.append(s ? s + '://' : "")
      .append(this.authority())
      .append('/').append(p)
      .append(q !== '' ? '?' : '')
      .append(q)
      .toString()
      .replace('/?', '?')
      .replace(/\/$/, '');
    return retStr;
  }

  static clone(uri) {
    return new TinyUri(uri.toString());
  }

}

/*
 * makeRequest
 * url: the source url for the AJAX request
 * term: the search terms (object) to be added as a query to the source url, such
 * as {query: 'foo'}
 * callback: a function to be called if the AJAX request is successful
 * _this: optional this used by the callback function
 * Builds a URL with the search term and makes an AJAX request.
 * returns promise.
 */
function makeRequest(url, term, queryParams = {}) {
  let searchParam = queryParams.searchParam;
  let requestParams = {};
  if (searchParam) requestParams[searchParam] = term;
  Object.assign(requestParams, queryParams.otherParams);

  let _url = new TinyUri(url).query.set(requestParams).toString();
  return fetch(_url).then((resp) => resp.json());
}

class StringBuilder$1 {
  constructor(string = '') {
    this.string = String(string);
  }
  toString() {
    return this.string;
  }
  append(val) {
    this.string += val;
    return this;
  }
  insert(pos, val) {
    let left = this.string.slice(0, pos);
    let right = this.string.slice(pos);
    this.string = left + val + right;
    return this;
  }
}

class STypeahead extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
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
     let str = new StringBuilder$1(item).insert(idx, bs).insert(idx + len + 3, be).toString();
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
    if (nVal && nVal !== '' && nVal !== oVal) {
      if (name === 'options' && this._options) {
        Object.assign(this._options, isJson(nVal) ? JSON.parse(nVal) : {});
        if (this._options.list && typeof this._options.list[0] === 'object') {
          if (!this._options.propertyInObjectArrayToUse) throw new Error('propertyInObjectArrayToUse required if list contains objects');
          this._options.list = this._options.list.map((li) => li[this._options.propertyInObjectArrayToUse]);
        }
        if (this._options.placeholder) this.input.placeholder = this._options.placeholder;
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
    this.shadowRoot.innerHTML = `<style>${css}</style><div><input /></div>`;
    this.input = this.shadowRoot.querySelector('input');
    this._options = this._options || {};
    this.activeClass = 'highlight';
    this.hoverClass = 'hover';
    this.input.onkeyup = this.onKeyupHandler.bind(this);
    // this.input.onfocus = this.onFocusHandler.bind(this);
    this.input.onblur = this.onBlurHandler.bind(this);
    this.datastore = new DataStore();
    this.actionFunctions = {
      // Enter key
      13: () => this.triggerSelect(this.getDropdownItems()[this.index], true),
      // Escape key
      27: () => this.clearSearch(),
      // Up arrow
      38: () => this.updateIndex(true),
      // Down arrow
      40: () => this.updateIndex()
    };
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
    return makeRequest(this._options.source, val, this._options.queryParams)
      .then((matches) => {
        let match = matches.find((m) => val === m[this._options.propertyInObjectArrayToUse]);
        return match ? match[this._options.propertyInObjectArrayToUse] : null;
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
    } else if (this._options.source) {
      // Otherwise, hook up to a server call and update the dropdown with the matches
      makeRequest(this._options.source, this.currentValue, this._options.queryParams).then((matches) => {
        matches = this._options.propertyInObjectArrayToUse ? matches.map((m) => m[this._options.propertyInObjectArrayToUse]) : matches;
        this.updateDropdown(matches);
        // if (Array.isArray(matches)) {
        //   let labels = this.parseMatches(matches);
        //   this.updateDropdown(labels, matches);
        // } else {
        //   this.updateDropdown(matches);
        // }
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
    document.dispatchEvent(new CustomEvent('selectionChangedEvent', {detail: {id: this._options.uid, value: this.input.value}}));
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
    if (typeof options === 'object') this.setAttribute('options', JSON.stringify(options));
    else this.setAttribute('options', options);
  }

  static get observedAttributes() {
    return ['options'];
  }
}

customElements.define('s-typeahead', STypeahead);

export { STypeahead };
