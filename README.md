s-typeahead
===================

This is a native v1 web component which provides a traditional typeahead or autocomplete.

# Use

```html
<s-typeahead options="options"></s-typeahead>
```

or

```Javascript
// Use with  list
let component = document.querySelector('s-typeahead');
let states = [
  {name: "Alabama", abbreviation: 'AL'},
  {name: "Alaska", abbreviation: 'AK'},
]; //
component.options = {
  list: states,
  propertyInObjectArrayToUse: 'name',
  requireSelectionFromList: true
};
// Use with a source url
let component = document.querySelector('s-typeahead');
component.options = {
  propertyInObjectArrayToUse: 'id',
  queryParams: {
    searchParam: 'id',
    otherParams: {
      limit: 10,
      type: 'starts'
    }
  },
  requireSelectionFromList: true,
  source: 'https://beta.familysearch.org/indexing/admin-new/labelids/search'
};
```
## Options

"options" is an object that can have the following properties:

- uid: (optional) Unique identified for the component. If provided, it is used in selectionChangedEvent, providing a way to identify a component when multiple components are used.
- list: A list of items to use for matching input. The list can be a flat array or an object array.
- placeholder: (optional) Text to be used as the placeholder for the text input.\
- initial value: the initial value of the input.
- propertyInObjectArrayToUse: If the list is an object array, the name of the property within the array to use for searching.
- requireSelectionFromList: Whether to force the user to select one of the choices in the list.
- source: url to use to fetch list. If list is provided, source is not. The source must return a JSON response of either a flat array or an object array, and propertyInObjectArrayToUse must be provided if an object array is returned.
- queryParams: an object containing query parameters to be used with the source url, and the query parameter to be used for searching for matches. The object needs to be in the following form:

```Javascript
{
  searchParam: 'query', // name of parameter uses for searching for matches
  otherParams: {foo: 'bar', bar: 'baz'}
}
```

## Custom CSS Properties
The component exposes the follow css custom properties:

- bold-color: The color of the bold element placed around matching text in the dropdown. Defaults to blue.
- border: The border style used by the component. Default is: 1px solid #ddd.
- dropdown-padding: The padding used for the dropdown list items. Defaults to 10px.
- dropdown-text-color: The text color of the dropdown items. Defaults to #555.
- font-family: The font family to be used. Defaults to arial.
- font-size: The font size used in the component. Defaults to 20px;
- highlight: The background-color for selected items in the dropdown.
- hover: The background-color used when hovering over dropdown items.
- input-padding: The padding used in the input element. Defaults to 10px;
- input-text-color: The color to use for the input element text. Defaults to #444;
- radius: The radius to be used for the top right and left of the input element. Defaults to 3px.

## Events

Fires a selectionChangedEvent when the selection changes. If options.uid is provided, the event detail includes it:
```Javascript
// assuming options.uid = 'foo';
document.addEventListener('foo:selectionChangedEvent', (evt) => {
  console.log("evt", evt)
  let uid = evt.detail.uid;
  let value = evt.detail.value;
})
```

# Installation

In Frontier apps, use bower. Otherwise you can use npm. When installed, the component adds the v1
polyfills to the dist directory so you don't have to figure out
how to get those loaded in Frontier since the polyfills do not currently support bower.

# Demo, Development & Testing

To see a demo of the component and to build it, run ```npm run dev```. This will build the assets and run a development server. Access it at http://localhost:8000.

To run the tests, run ```npm run karma```.
