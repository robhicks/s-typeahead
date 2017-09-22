import TinyUri from '../node_modules/tiny-uri/src/TinyUri';
/*
 * makeRequest
 * url: the source url for the AJAX request
 * term: the search terms (object) to be added as a query to the source url, such
 * as {query: 'foo'}
 * callback: a function to be called if the AJAX request is successful
 * _this: optional this used by the callback function
 * Builds a URL with the search term and makes an AJAX request.
 * returns promise.
 */
export default function makeRequest(url, term, queryParams = {}) {
  let searchParam = queryParams.searchParam;
  let requestParams = {};
  if (searchParam) requestParams[searchParam] = term;
  Object.assign(requestParams, queryParams.otherParams);

  let _url = new TinyUri(url).query.set(requestParams).toString();
  if (term === '') Promise.resolve([]);
  return fetch(_url).then((resp) => resp.json());
}
// export default function makeRequest(url, term, queryParams = {}) {
//   let searchParam = queryParams.searchParam;
//   let requestParams = {};
//   if (searchParam) requestParams[searchParam] = term;
//   Object.assign(requestParams, queryParams.otherParams);
//   let _url = new TinyUri(url).query.set(requestParams).toString();
//   let _urlDecoded = decodeURIComponent(_url);
//   let _urlFinal = _urlDecoded.replace(/(:=)+/g, ':')
//   if (term === '') Promise.resolve([]);
//   let myHeaders = new Headers();
//   myHeaders.append('Accept', 'application/json');
//   console.log('myHeaders', myHeaders);
//   let myInit = {
//     method: 'GET',
//     headers: myHeaders,
//   }
//   console.log('myInit', myInit);
//   return fetch(_urlFinal, myInit).then((resp) => resp.json());
// }
