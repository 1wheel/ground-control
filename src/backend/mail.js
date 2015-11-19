import Mailgun from 'mailgun-js';
import {EmailTemplate} from 'email-templates';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
const templateDir = path.resolve(__dirname, './email-templates');
const headerHTML = fs.readFileSync(templateDir + '/header.hbs', {encoding: 'utf-8'});
const footerHTML = fs.readFileSync(templateDir + '/footer.hbs', {encoding: 'utf-8'});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
Handlebars.registerPartial('header', headerHTML);
Handlebars.registerPartial('footer', footerHTML);

export default class MG {
  constructor(apiKey, domain) {
    this.mailgun = Mailgun({apiKey: apiKey, domain: domain});
  }

  async sendEventConfirmation(form, constituent, event_types, debugging) {

    if (form.capacity=='0'){form.capacity = 'unlimited'};
    
    // Sort event dates by date
    form.event_dates = JSON.parse(form.event_dates);
    form.event_dates.sort(function(a, b) {
        return a.date.localeCompare(b.date);
    });

    // Get the event type name
    event_types.forEach( function(type){
      if (type.event_type_id == form.event_type_id){
        form.event_type_name = type.name;
      }
    });

    let data = {
      event: form,
      user: constituent
    }

    let eventConfirmation = new EmailTemplate(templateDir + '/event-create-confirmation');
    let content = await eventConfirmation.render(data);

    let message = {
      from: 'Volunteer Portal<ground-control@' + process.env.MAILGUN_DOMAIN + '>',
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      text: content.text,
      html: content.html
    };

    if (debugging){
      return message;
    }
    else{
      let response = await this.mailgun.messages().send(message);
      return response;
    }
  }

}