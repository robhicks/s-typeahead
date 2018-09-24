export default class DataStore {
  constructor() {
    this.storeMap = {};
  }

  // this.get(el, "hi");
  get(element, key) {
    return this.getStore(element)[key] || null;
  }

  getAll() {
    console.log("this.storeMap", this.storeMap)
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
