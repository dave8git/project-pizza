import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames, templates} from './settings.js';
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
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parseResponse', parsedResponse);

        thisApp.data.products = parsedResponse; /* save parsedResponse as thisApp.data.products */

        thisApp.initMenu(); /* execute initMenu method */

      });
    console.log('this.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
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
