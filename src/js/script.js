/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initOrderForm();
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
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
    initAccordion() {
      const thisProduct = this;
      // const clicableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); /* find the clicable trigger (the element that should react to clicking) */
      //console.log(clicableTrigger);
      console.log('thisProduct', thisProduct);
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* START: click event listener to trigger */
        event.preventDefault(); /*prevent default action for event */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); /* toggle active class on element of thisProduct */
        console.log('clicked');
        console.log(thisProduct.element);
        const activeProducts = document.querySelectorAll(select.all.menuProducts); /* find all active products */
        console.log(activeProducts);
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
      console.log('initOrderForm - thisProduct', thisProduct);
    }
    processOrder() {
      //const thisProduct = this;
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      //const testProduct = new Product();
      //console.log('testProduct:', testProduct);
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.init();
}
