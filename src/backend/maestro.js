import requestPromise from 'request-promise';

export default class Maestro {
  constructor(customerUID, secretToken, URL, fakeCall) {
    this.customerUID = customerUID;
    this.secretToken = secretToken;
    this.URL = URL;
    this.fakeCall = fakeCall;
  }

  createConferenceCall(name, maxReservations, startDate, duration, {contactEmail=null, greenroom=null, recording=null, backgroundMusic=null}={}) {

    var postParams = {contactEmail, greenroom, recording, backgroundMusic}

    Object.keys(postParams).forEach((key) => typeof postParams[key] === 'undefined' ? delete postParams[key] : true);

    Object.assign(postParams, {
      customer: this.customerUID,
      key: this.secretToken,
      name: name,
      reservationCount: 1,
      estimatedCallers1: maxReservations,
      startDate1: startDate,
      duration1: duration,
      type: 'json'
    });

    var options = {
      uri: this.URL + '/createConferenceReserved',
      method: 'POST',
      form: postParams,
      json: true
    }

    if (this.fakeCall) {
      console.log('Would have made request: ' + JSON.stringify(options))
      return true;
    }
    return requestPromise(options);
  }
}