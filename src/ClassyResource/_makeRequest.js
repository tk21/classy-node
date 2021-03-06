import _ from 'lodash';
import request from 'request';

/**
 * Makes a request to Classy's API.
 *
 * @param  {string} path    Request URI
 * @param  {string} method  Request method
 * @param  {object} headers Request headers
 * @param  {object} form    Request form (optional)
 * @return {promise}         Promise based on API request
 */
export default function _makeRequest(path, method, headers, form, data) {
  const _this = this;
  let forceQs = null;

  if (data.noLog) {
    headers['x-no-log'] = true;
    delete data.noLog;
  }

  if (_.isObject(data.qs)) {
    forceQs = data.qs;
    delete data.qs;
  }

  const promise = new Promise((resolve, reject) => {
    const requestParams = {
      baseUrl: this.baseUrl,
      uri: path,
      method: method,
      headers: headers,
      rejectUnauthorized: false,
      form: form
    };

    if (method === 'GET') {
      requestParams.qs = data;
    } else {
      requestParams.body = JSON.stringify(data);
    }

    if (forceQs) {
      requestParams.qs = _.merge(requestParams.qs || {}, forceQs);
    }

    request(requestParams, (err, response, body) => {
      if (err || !/^2/.test('' + response.statusCode)) {
        let error;
        if (err && err instanceof Error) {
          error = err;
        } else if (err && !(err instanceof Error)) {
          const errorString = JSON.stringify(err);
          error = new Error(errorString);
        } else {
          const errorString = body ? JSON.stringify(body) : 'Non-200 response';
          error = new Error(errorString);
          error.statusCode = response.statusCode;
        }

        reject(error);
      } else {
        body = body ? JSON.parse(body) : {};
        resolve(body);
      }
    });

  });

  return promise;
}
