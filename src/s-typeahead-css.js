export default `
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
  max-height: var(--list-height, 218px);
  overflow-y: auto;
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
