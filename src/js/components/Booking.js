import {
  templates,
  select,
  settings
} from '../settings.js';
import {
  utils
} from '../utils.js';
import {
  AmountWidget
} from './AmountWidget.js';
import {
  DatePicker
} from './DatePicker.js';
import {
  HourPicker
} from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    // thisBooking.generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }
  initWidget() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
  getData() {
    const thisBooking = this;
    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }
  parseData(bookings, eventsCurrent) {
    const thisBooking = this;
    thisBooking.booked = {};
    console.log('eventsCurrent', eventsCurrent);
    for (const eventCurrent of eventsCurrent) {
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }
    console.log('thisBooking', thisBooking.booked);

  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }

    const bookingHour = utils.hourToNumber(hour);

    const lastBookedHour = bookingHour + duration;

    for (let tableBlockedHour = bookingHour; tableBlockedHour < lastBookedHour; tableBlockedHour += .5) {
      console.log('!!!!!!!!', tableBlockedHour);
    }


    // const bookedHour = utils.hourToNumber(hour);
    // thisBooking.booked = {
    //   [date]: {
    //     [bookedHour]: [table],
    //   }
    // };
    // const lastBookedHour = bookedHour + duration;
    // thisBooking.booked[date].push([lastBookedHour][table]);

    // console.log(lastBookedHour);

    // for (let tableBookedHour = bookedHour; tableBookedHour < lastBookedHour;  ) {

    // }
  }
}
