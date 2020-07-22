/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.initAccordion();
      //console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); /* generate HTML based on template */
      //console.log('generatedHTML', generatedHTML);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); /* create element using utils.createElementFromHTML */
      const menuContainer = document.querySelector(select.containerOf.menu); /* find menu container */
      menuContainer.appendChild(thisProduct.element); /* add element to menu */
    }
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion() {
      const thisProduct = this;
      // const clicableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); /* find the clicable trigger (the element that should react to clicking) */
      //console.log(clicableTrigger);
      // console.log('thisProduct', thisProduct);
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* START: click event listener to trigger */
        event.preventDefault(); /*prevent default action for event */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); /* toggle active class on element of thisProduct */
        // console.log('clicked');
        // console.log(thisProduct.element);
        const activeProducts = document.querySelectorAll(select.all.menuProducts); /* find all active products */
        // console.log(activeProducts);
        for (let activeProduct of activeProducts) {
          /* START LOOP: for each active product */
          if (activeProduct != thisProduct.element) {
            /* START: if the active product isn't the element of thisProduct */
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive); /* remove class active for the active product */
          } /* END: if the active product isn't the elemnt of thisProduct */
        } /* END LOOP: for each active product */
      }); /* END: click event listener to trigger */
    }
    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();

        thisProduct.processOrder();
        thisProduct.addToCart();
      });
      // console.log('initOrderForm - thisProduct', thisProduct);
    }
    processOrder() {
      const thisProduct = this;
      thisProduct.params = {};
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      for (let paramId in thisProduct.data.params) {
        // console.log(thisProduct.data.params[paramId]);
        const param = thisProduct.data.params[paramId];
        // console.log('param', param);
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          // console.log(optionSelected);
          if (optionSelected && !option.default) {
            price += option.price;
            // console.log('price', price);
          } else if (!optionSelected && option.default) {
            price -= option.price;
            // console.log('price', price);
          }
          const activeImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          // console.log('activeImages', activeImages);
          if (optionSelected) {
            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            for (let activeImage of activeImages) {
              activeImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for (let activeImage of activeImages) {
              activeImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.initActions();
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      console.log('AmountWidget', thisWidget);
      console.log('constructor arguments:', element);
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      /* TODO: Add validation */
      if ((thisWidget.value != value) && (newValue >= settings.amountWidget.defaultMin) && (newValue <= settings.amountWidget.defaultMax)) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;

    }
    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue((thisWidget.value) - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue((thisWidget.value) + 1);
      });
    }
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

      console.log('thisCart.dom.toggleTrigger', thisCart.dom.toggleTrigger);
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function () {
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function() {
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;
      const payload = {
        totalPrice: thisCart.totalPrice,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        phone: thisCart.dom.phone.value,
        address: thisCart.dom.address.value,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };
      for (let product in payload.products) {
        payload.products.push(product.getData());
      }
      console.log(payload);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options).then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
    }

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      const cartContainer = document.querySelector(select.cart.productList);
      cartContainer.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      // console.log('generated dom', thisCart.element);
      // console.log('generatedHTML', generatedHTML);
      // console.log('adding product', menuProduct);
      thisCart.update();
    }
    update() {
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      console.log('thisCart.deliveryFee!!!', thisCart.deliveryFee);

      for (let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      console.log('totalNumber', thisCart.totalNumber);
      console.log('subtotalPrice', thisCart.subtotalPrice);

      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }
    remove(cartProduct) {
      const thisCart = this;
      console.log(thisCart.products);
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      this.update();
    }

  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      console.log('new CartProduct', thisCartProduct);
      console.log('productData', menuProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.price = thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log(event);
    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event){
        event.preventDefault();
        thisCartProduct.remove();

      });
    }
    getData() {
      const thisCartProduct = this;
      return {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        amount: thisCartProduct.amount,
        params: thisCartProduct.params,
      };
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
      //const testProduct = new Product();
      //console.log('testProduct:', testProduct);
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;
      console.log('url', url);
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parseResponse', parsedResponse);

          thisApp.data.products = parsedResponse; /* save parsedResponse as thisApp.data.products */

          thisApp.initMenu();/* execute initMenu method */

        });
      console.log('this.data', JSON.stringify(thisApp.data));
    },
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
      console.log(thisApp);
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      // thisApp.initMenu();
      thisApp.initCart();
    },
  };
  app.init();
}
