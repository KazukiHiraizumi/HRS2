function XHRget(url) {
  // Return a new promise.
  console.log('XHRget:'+url);
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else{
        reject(Error(req.statusText));
//        reject(req.response);
      }
    }
    req.onerror = function() {
      reject(Error("Network Error"));
    }

    // Make the request
    req.open('GET', url);
    req.send();
  });
}