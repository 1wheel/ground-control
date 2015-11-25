import requestPromise from 'request-promise';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';
import {parseString} from 'xml2js';
import Promise from 'bluebird';

const parseStringPromise = Promise.promisify(parseString);

export default class BSD {
  constructor(host, id, secret) {
    this.baseURL = url.parse('http://' + host);
    this.baseURL.pathname = '/page/api/';
    this.apiId = id;
    this.apiVersion = 2;
    this.apiSecret = secret;
  }

  cleanField(field) {
    if (field && field.length) {
      if (field[0] && field[0] != '')
        return field[0]
      else
        return null
    }
    else
      return null
  }

  createSurveyObject(survey) {
    let surveyObj = {}
    Object.keys(survey).forEach((key) => {
      surveyObj[key] = this.cleanField(survey[key])
    })
    return surveyObj;
  }

  createConstituentObject(constituent) {
    let consObj = {};
    consObj['id'] = constituent['$']['id'];
    consObj['modified_dt'] = constituent['$']['modified_dt'];

    let keys = ['firstname', 'middlename', 'lastname', 'has_account', 'is_banned', 'create_dt', 'prefix', 'suffix', 'gender', 'source', 'subsource']

    keys.forEach((key) => {
      consObj[key] = this.cleanField(constituent[key])
    })
    consObj['cons_addr'] = []
    if (constituent.cons_addr){
      constituent.cons_addr.forEach((address) => {
        let addrObj = {}
        let keys = ['addr1', 'addr2', 'city', 'state_cd', 'zip', 'country', 'latitude', 'longitude', 'is_primary', 'cons_addr_type_id', 'cons_addr_type'];
        keys.forEach((key) => {
          addrObj[key] = this.cleanField(address[key])
        })
        consObj['cons_addr'].push(addrObj)
      })
    }
    consObj['cons_phone'] = []
    if (constituent.cons_phone){
      constituent.cons_phone.forEach((phone) => {
        let phoneObj = {}
        let keys = ['phone', 'phone_type', 'is_subscribed', 'is_primary']
        keys.forEach((key) => {
          phoneObj[key] = this.cleanField(phone[key]);
        })
        consObj['cons_phone'].push(phoneObj)
      })
    }
    consObj['cons_email'] = []
    if (constituent.cons_email){
      constituent.cons_email.forEach((email) => {
        let emailObj = {}
        let keys = ['email', 'email_type', 'is_subscribed', 'is_primary']
        keys.forEach((key) => {
          emailObj[key] = this.cleanField(email[key])
        })
        consObj['cons_email'].push(emailObj)
      })
    }

    return consObj;
  }

  generateBSDURL(callPath, {params={}, secure=false}={}) {
    if (callPath[0] === '/')
      callPath = callPath.substring(1, callPath.length);
    callPath = url.resolve(this.baseURL.pathname, callPath)
    let timestamp = Math.floor(Date.now() / 1000);
    params['api_ver'] = this.apiVersion;
    params['api_id'] = this.apiId;
    params['api_ts'] = timestamp;

    let sortedParams = Object.keys(params).sort().map((key) => {
      let param = {}
      param[key] = params[key]
      return param;
    });

    let unencodedQueryString = sortedParams.map((element) => {
      let key = Object.keys(element)[0]
      return key + '=' + element[key]
    }).join('&');

    let signingString = [
      params['api_id'],
      params['api_ts'],
      callPath,
      unencodedQueryString
    ].join('\n');

    let encryptedMessage = crypto.createHmac('sha1', this.apiSecret);
    encryptedMessage.update(signingString);
    let apiMac = encryptedMessage.digest('hex');
    sortedParams.push({api_mac : apiMac});
    let encodedQueryString = sortedParams.map((element) => {
      return querystring.stringify(element)
    }).join('&');
    let finalURL = url.parse(url.resolve(url.format(this.baseURL), callPath));
    finalURL.protocol = 'https:';
    finalURL.search = '?' + encodedQueryString;
    return url.format(finalURL);
  };

  async getConstituentGroup(groupId) {
    let response = await this.request('cons_group/get_constituent_group', {cons_group_id: groupId}, 'GET');
    response = await parseStringPromise(response);
    return response;
  }

  async getForm(formId) {
    let response = await this.request('signup/get_form', {signup_form_id: formId}, 'GET');

    response = await parseStringPromise(response);
    let survey = response.api.signup_form;
    if (!survey)
      return null;
    if (survey.length && survey.length > 0)
      survey = survey[0];

    return this.createSurveyObject(survey);
  }

  createBundleString(bundles) {
    return bundles.join(',')
  }

  async getConstituentByEmail(email) {
    let response = await this.request(
      '/cons/get_constituents_by_email',
      {
        emails: email,
        bundles: this.createBundleString(['cons_email', 'cons_addr', 'cons_phone'])
      },
      'GET'
    );

    response = await parseStringPromise(response);
    let constituent = response.api.cons;

    if (!constituent)
      return null;
    if (constituent.length && constituent.length > 0)
      constituent = constituent[0]

    return this.createConstituentObject(constituent)
  }

// This is probably broken now, and we aren't using it.
/*  async getConstituents(filter, bundles) {
    let filterStrings = []
    Object.keys(filter).forEach((key) => {
      let val = ''
      if (typeof filter[key].join === 'function') {
        val = '(' + filter[key].join(',') + ')';
      }
      else
        val = filter[key];
      filterStrings.push(key + '=' + val)
    })
    let filterString = filterStrings.join(',');
    let response = await this.request('cons/get_constituents', {filter: filterString, bundles: this.createBundleString(bundles)}, 'GET');
    return JSON.parse(XMLParser.toJson(response)).map((element) => this.cleanConstituent(this.cleanOutput(element)));
  }*/

  async getConsIdsForGroup(groupId) {
    let response = await this.request('/cons_group/get_cons_ids_for_group', {cons_group_id: groupId})
    return {
      consIds: response.trim().split('\n')
    }
  }

  async getDeferredResult(deferredId) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let response = await this.makeRawRequest('/get_deferred_results', {deferred_id: deferredId}, 'GET');
        if (response.statusCode === 202)
          resolve(this.getDeferredResult(deferredId))
        else
          resolve(response.body)
      }, 1000)
    })
  }

  async getEventTypes() {
    let response = await this.request('event/get_available_types', {}, 'GET');
    return response
  }

  async createConstituent(email) {
    let params = '<?xml version="1.0" encoding="utf-8"?><api><cons><cons_email><email>' + email + '</email></cons_email></cons></api>';
    let response = await this.sendXML('/cons/set_constituent_data', params, 'POST');
    response = await parseStringPromise(response);

    let constituent = await this.getConstituentByEmail(email);

    console.log(constituent);

    // generate a 'random' 9-14 character alphanumeric password
    let password = randString(Math.floor(Math.random() * 6) + 9);
    constituent['password'] = password;

    // set the constituent password asynchronously
    this.setConstituentPassword(email, password);
    return constituent;

    function randString(x){
        let s = '';
        while(s.length<x&&x>0){
            let r = Math.random();
            s+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
        }
        return s;
    }
  }

  async setConstituentPassword(email, password) {
    // response will be empty if successful
    let response = await this.request('/account/set_password', {userid: email, password: password}, 'POST');
    return 'password set';
  }

  async checkCredentials(email, password) {
    try{
      let response = await this.request('/account/check_credentials', {userid: email, password: password}, 'POST');
      console.log(response);
    }
    catch(e){
      console.log(e);
      return 'invalid username or password'
    }
    let response = await parseStringPromise(response);
    return response
  }

  async createEvents(cons_id, form, event_types) {
    let eventType = null;
    event_types.forEach((type) => {
      if (type.event_type_id == form['event_type_id']){
        eventType = type;
      }
    })

    // validations
    // Remove special characters from phone number
    let contact_phone = form['contact_phone'].replace(/\D/g,'');

    let params = {
        event_type_id: form['event_type_id'],
        creator_cons_id: cons_id,
        name: form['name'],
        description: form['description'],
        venue_name: form['venue_name'],
        venue_zip: form['venue_zip'],
        venue_city: form['venue_city'],
        venue_state_cd: form['venue_state_cd'],
        venue_addr1: form['venue_addr1'],
        venue_addr2: form['venue_addr2'],
        venue_country: form['venue_country'],
        venue_directions: form['venue_directions'],
        days: [{
            duration: form['duration_num'] * form['duration_unit'],
            capacity: form['capacity']
        }],
        local_timezone: form['start_tz'],
        attendee_volunteer_message: form['attendee_volunteer_message'],
        is_searchable: form['is_searchable'],
        public_phone: form['public_phone'],
        contact_phone: contact_phone,
        host_receive_rsvp_emails: form['host_receive_rsvp_emails'],
        rsvp_use_reminder_email: form['rsvp_use_reminder_email'],
        rsvp_reminder_hours: form['rsvp_email_reminder_hours']
    };

    // Add params if supported by event type
    if (Number(eventType.attendee_volunteer_show) == 1){
      params['attendee_volunteer_show'] = form['attendee_volunteer_show'];
    }

    let startHour = null;
    if (form['start_time']['a'] == 'pm'){
      startHour = Number(form['start_time']['h']) + 12;
    }
    else{
      startHour = form['start_time']['h'];
    }

    let eventDates = JSON.parse(form['event_dates']);

    let status = 'success';

    await eventDates.forEach(async (newEvent) => {
      let startTime = newEvent['date'] + ' ' + startHour + ':' + form['start_time']['i'] + ':00'
      params['days'][0]['start_datetime_system'] = startTime;
      let response = await this.request('/event/create_event', {event_api_version: 2, values: JSON.stringify(params)}, 'POST');
      // console.log(response);
      if (response.validation_errors){
        console.log(response);
        status = 'error';
      }
    });

    return status
  }

  async makeRawRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath, {params});
    let options = {
      uri: finalURL,
      method: method,
      resolveWithFullResponse: true,
      json: true
    }
    return requestPromise(options)
  }

  async makeRawXMLRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath);
    let options = {
      uri: finalURL,
      method: method,
      body: params,
      resolveWithFullResponse: true
    }
    // console.log(options);
    return requestPromise(options)
  }

  async request(callPath, params, method) {
    let response = await this.makeRawRequest(callPath, params, method);
    if (response.statusCode === 202)
      return this.getDeferredResult(response.body);
    else
      return response.body;
  }

  async sendXML(callPath, params, method) {
    let response = await this.makeRawXMLRequest(callPath, params, method);
    if (response.statusCode === 202)
      return this.getDeferredResult(response.body);
    else
      return response.body;
  }
}
