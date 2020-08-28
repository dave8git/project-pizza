export class BaseWidget {
    constructor(wrapperElement, initialValue) {
        const thisWidget = this;
        
        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement; 
        thisWidget.correctValue = initialValue;
    }
    get Value() {
        const thisWidget = this; 

        return thisWidget.correctValue; 
    }

    set Value(assingedValue) {
        const thisWidget = this; 

        const newValue = thisWidget.parseValue(assingedValue);

        if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
            thisWidget.correctValue = newValue; 
            thisWidget.announce();
        }
        thisWidget.renderValue(); 
    }

    parseValue(newValue) {
        return parseInt(newValue);
    }

    isValid(newValue) {
        return !isNaN(newValue);
    }

    renderValue() {
        const thisWidget = this; 

        thisWidget.dom.wrapper.innerHTML = thisWidget.value;
    }

    announce() {
        const thisWidget = this;
        const event = new CustomEvent('updated', {
          bubbles: true
        });
    
        thisWidget.element.dispatchEvent(event);
      }
    
}


