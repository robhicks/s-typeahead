describe('<s-typeahead>', () => {
  let component;
  let options = {
    list: [
      {name: 'Alaska'},
      {name: 'Alabama'},
      {name: 'Utah'},
      {name: 'Wyoming'}
    ],
    propertyInObjectArrayToUse: 'name',
    uid: 'foo'
  };

  before((done) => {
    component = document.createElement('s-typeahead');
    document.body.appendChild(component);
    setTimeout(done, 0);
  });

  after(() => {
    component.parentNode.removeChild(component);
  });

  it('should exist and have certain properties and methods', () => {
    component.options = options;
    expect(component).to.exist;
    expect(component.options).to.be.an('object');
    expect(component.addItems).to.be.a('function');
    expect(component.bindItems).to.be.a('function');
    expect(component.clearData).to.be.a('function');
    expect(component.clearDropdown).to.be.a('function');
    expect(component.clearSearch).to.be.a('function');
    expect(component.createDropdown).to.be.a('function');
    expect(component.deselectAllItems).to.be.a('function');
    expect(component.deselectItems).to.be.a('function');
    expect(component.displayDropdown).to.be.a('function');
    expect(component.getActionFromKey).to.be.a('function');
    expect(component.getActiveItems).to.be.a('function');
    expect(component.getDropdownItems).to.be.a('function');
    expect(component.getHoverItems).to.be.a('function');
    expect(component.getInputValue).to.be.a('function');
    expect(component.getItemFromList).to.be.a('function');
    expect(component.hideDropdown).to.be.a('function');
    expect(component.datastore).to.be.an('object');
    expect(component.actionFunctions).to.be.an('object');
  });

  it('should handle a an list array', () => {
    component.options = options;
    expect(component._options.list).to.eql(['Alaska', 'Alabama', 'Utah', 'Wyoming']);
  });

  it('should handle a flat list array', () => {
    options.list = ['Alaska', 'Alabama', 'Utah', 'Wyoming'];
    component.options = options;
    expect(component._options.list).to.eql(options.list);
  });

  it('should render an input element', () => {
    component.options = options;
    expect(component.shadowRoot.querySelector('input')).to.exist;
  });

  it('should render a dropdown', () => {
    component.options = options;
    let input = component.shadowRoot.querySelector('input');
    input.focus();
    input.value = 'al';
    expect(component.shadowRoot.querySelector('div.wrapper')).to.exist;
    expect(component.shadowRoot.querySelector('ul')).to.exist;
  });


});
