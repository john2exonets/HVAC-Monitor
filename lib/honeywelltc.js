//
//  honeywelltc.js  --  Honeywell Total Comfort API Module
//
//  John D. Allen
//  March, 2020
//
//  Based on: https://github.com/NorthernMan54/homebridge-tcc/blob/master/lib/tcc.js
//  Tested on my RTH6500's
//
var LIBVERSION = "0.02";
var MAXTIMEOUT = 10;        // Timeout for looping REST API calls, in seconds.

var request = require('request');
var jar = request.jar();
var util = require('util');

var TIMEOUT = 10000;  // Timeout for a single REST API call, in ms.

var cookies = [];
var DeviceID = "";        // Honewell Device ID
var User = "";            // Username to connect with
var Passwd = "";          // Password to connect with
var DEBUG = 0;

var readyFlag = false;

/**
 * Constructor
 * @param {object} opts
 */
function htc(opts) {
  DEBUG = opts.DEBUG || 0;
  DeviceID = opts.DeviceID || "";
  User = opts.User || 'user';
  Passwd = opts.Passwd || 'password';

  if (DEBUG > 5) { console.log("DEBUG = " + DEBUG); }
  _connectHTC().then(() => {
    readyFlag = true;
  }).catch((err) => {
    console.log("Error on Connect: " + err);
    process.exit(1);
  });
}

var API = htc.prototype;
module.exports = htc;

//--------------------------------------------------------------------------
// Function: set()  -- Modify Module Variables
//--------------------------------------------------------------------------
API.set = function(id,val) {
  switch(id) {
    case "DeviceID":
      DeviceID = val;
      break;
    case "User":
      User = val;
      break;
    case "Passwd":
      Passwd = val;
      break;
    case "DEBUG":
      DEBUG = val;
      break;
  }
}

//  -- Getter Functions
API.DeviceID = function() { return DeviceID; }
API.User = function() { return User; }
API.Passwd = function() { return Passwd; }
API.Debug = function() { return DEBUG; }
API.Version = function() { return LIBVERSION; }

//  --  Unit Modes
API.HEAT = 1;
API.OFF = 2;
API.COOL = 3;
API.AUTO = 4;

//---------------------------------------------------------------------------
// Function: _connectHTC())
//   Initial API Call required to get Authorized to server.
//---------------------------------------------------------------------------
function _connectHTC() {
  if (DEBUG > 5) { console.log("_connectHTC()"); }
  return new Promise((resolve,reject) => {
    request({
      jar: jar,
      method: 'GET',
      url: 'https://mytotalconnectcomfort.com/portal/',
      timeout: 10000,
      strictSSL: false,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "sdch",
        "Host": "mytotalconnectcomfort.com",
        "DNT": "1",
        "Origin": "https://mytotalconnectcomfort.com/portal",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36"
      },
    }, function(err, response) {
      // Response s/b 200 OK
      if (err || response.statusCode != 200) {
        console.log("TCC Login Failed, can't connect to TCC Web Site", err);
        reject(err);
        return err;
      } else {
        if (DEBUG > 8) {
          console.log("_connectHTD() - 1");
          console.log("STATUS:" + response.statusCode);
          console.log("       " + response.statusMessage);
          console.log("-------------------------------------------");
          console.log(response.headers);
          console.log("-------------------------------------------");
          // console.log(response.body);
          // console.log("-------------------------------------------");
        }
        request({
          jar: jar,
          method: 'POST',
          url: 'https://mytotalconnectcomfort.com/portal/',
          timeout: 10000,
          strictSSL: false,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "sdch",
            "Host": "mytotalconnectcomfort.com",
            "DNT": "1",
            "Origin": "https://mytotalconnectcomfort.com/portal",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36"
          },
          form: {
            UserName: User,
            Password: Passwd,
            RememberMe: "false"
            //		ApplicationId: appId
          }
        }, function(err, response) {
          // response s/b 302
          if (err || response.statusCode != 302) {
            console.log("TCC Login Failed - POST", err);
            if (response) console.log(response.statusCode);
            reject("TCC Login failed, please check your credentials");
            return err;

          } else {
            if (DEBUG > 8) {
              console.log("_connectHTD() - 2");
              console.log("STATUS:" + response.statusCode);
              console.log("       " + response.statusMessage);
              console.log("-------------------------------------------");
              console.log(response.headers);
              console.log("-------------------------------------------");
              // console.log(response.body);
              // console.log("-------------------------------------------");
            }
            request({
              jar: jar,
              method: 'GET',
              url: 'https://mytotalconnectcomfort.com/portal/',
              timeout: 10000,
              strictSSL: false,
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "sdch",
                "Host": "mytotalconnectcomfort.com",
                "DNT": "1",
                "Origin": "https://mytotalconnectcomfort.com/portal",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36"
              },
            }, function(err, response) {
              if (err || response.statusCode != 200) {
                console.log("TCC Login failed - GET", err);
                if (response) console.log(response.statusCode);
                reject("TCC Login failed - GET");
                return err;
              } else {
                if (DEBUG > 8) {
                  console.log("_connectHTD() - 3");
                  console.log("STATUS:" + response.statusCode);
                  console.log("       " + response.statusMessage);
                  console.log("-------------------------------------------");
                  console.log(response.headers);
                  console.log("-------------------------------------------");
                  // console.log(response.body);
                  // console.log("-------------------------------------------");
                }
                resolve(response.statusCode);
              }
            }); // request

          }
        }); // request
      }
    }); // request
  });  // Promise
}

//---------------------------------------------------------------------------
// Function: _request())
//   Call Honeywell Server with request.
//---------------------------------------------------------------------------
API._request = function(url) {
  if (DEBUG > 5) { console.log("_request()"); }
  return new Promise((resolve,reject) => {
    API.whenReady().then(() => {
      request({
        method: 'GET',
        url: url,
        jar: jar,
        timeout: 30000,
        strictSSL: false,
        headers: {
          "Accept": "*/*",
          "DNT": "1",
          "Accept-Encoding": "plain",
          "Cache-Control": "max-age=0",
          "Accept-Language": "en-US,en,q=0.8",
          "Connection": "keep-alive",
          "Host": "mytotalconnectcomfort.com",
          "Referer": "https://mytotalconnectcomfort.com/portal/",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36"
        }
      }, function(err, response) {
        if (err || response.statusCode != 200 || response.statusMessage != "OK") {
          if (err) {
            console.log("Error _request", url, err);
            reject(err);
          } else {
            if (response.statusCode == 401) {  // Auth has timed out...re-Auth...
              readyFlag = false;
              _connectHTC().then(() => {
                readyFlag = true;
                resolve(API._request(url));  // retry the request and resolve.
              }).catch((err) => {
                console.log("Error on Connect: " + err);
                reject(err);
              });
            } else {
              console.log("Error _request", url, response.statusCode);
              reject("HTTP Error " + response.statusCode);
            }
          }
          return err;

        } else {
          if (DEBUG > 8) {
            console.log("_request()");
            console.log("STATUS:" + response.statusCode);
            console.log("       " + response.statusMessage);
            console.log("-------------------------------------------");
            console.log(response.headers);
            console.log("-------------------------------------------");
            // console.log(response.body);
            // console.log("-------------------------------------------");
          }
          var json;
          //console.log("_request", url, response.body);
          try {
            json = JSON.parse(response.body);
          } catch (ex) {
            //                console.error(ex);
            console.error(response.statusCode, response.statusMessage);
            console.error(response.body);
            //                console.error(response);
            reject(ex);
          }
          if (json) {
            if (DEBUG > 8) { console.log("BODY:" + util.inspect(json,{depth: null, colors: true})); }
            resolve(json);
          }
        }
      });  // request

    }).catch((err) => {
      reject(err);
    });  //whenReady()
  });  // promise
}

//---------------------------------------------------------------------------
// Function: whenReady()
//   Wait for initial connect to finish
//---------------------------------------------------------------------------
API.whenReady = function() {
  if (DEBUG > 5) { console.log("whenReady()"); }
  return new Promise((resolve,reject) => {
    var count = 0;
    var interval = setInterval(function () {
      count++;
      if (readyFlag) {
          clearInterval(interval);
          resolve();
      };
      if(count >= MAXTIMEOUT) {
        clearInterval(interval);
        reject("[1]Timeout waiting for Initial Login to Complete");
      }
    }, 1000);  // Check every second.
  });
}

//---------------------------------------------------------------------------
// Function: chkDataSession())
//   Get Data from the passed Device.
//---------------------------------------------------------------------------
API.chkDataSession = function(devId) {
  if (DEBUG > 5) { console.log("chkDataSession()"); }
  return new Promise((resolve,reject) => {
    var utc_seconds = Date.now();

    var url = "https://mytotalconnectcomfort.com/portal/Device/CheckDataSession/" + devId + "?_=" + utc_seconds;
    API._request(url).then((out) => {
      //console.log(":::" + out.success + ", " + out.communicationLost);
      if (out.success && ! out.communicationLost) {
        resolve(out);
      } else {
        reject("Connection to device " + devID.toString() + " is down");
      }
    }).catch((err) => {
      if (DEBUG > 8) { console.log("CDS Failed:" + err); }
      reject(err);
    });
  });
}

//---------------------------------------------------------------------------
// Function: setHeatCoolSetpoint())
//   Set the heat and cool temps to turn on.
//---------------------------------------------------------------------------
API.setHeatCoolSetpoint = function(deviceId, heatSetPoint, coolSetPoint, usePermanentHolds) {
  if (DEBUG > 5) { console.log("setHeatCoolSetpoint()"); }
  return new Promise((resolve,reject) => {
    var url = "https://mytotalconnectcomfort.com/portal/Device/SubmitControlScreenChanges";

    // Next status is 1 for temporary or 2 for permanent hold.
    var nextStatus = 1;
    if (usePermanentHolds) {
      nextStatus = 2;
    }

    var body = JSON.stringify({
      "DeviceID": Number(deviceId),
      "SystemSwitch": null,
      "HeatSetpoint": heatSetPoint,
      "CoolSetpoint": coolSetPoint,
      "HeatNextPeriod": null,
      "CoolNextPeriod": null,
      "StatusHeat": nextStatus,
      "StatusCool": nextStatus,
      "FanMode": null
    });

    if (DEBUG > 8) {
      console.log(body);
    }

    API.whenReady().then(() => {
      request({
        method: 'POST',
        url: url,
        jar: jar,
        timeout: 15000,
        strictSSL: false,
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'Keep-Alive',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json; charset=UTF-8',
          'DNT': 1,
          'Host': 'mytotalconnectcomfort.com',
          'Origin': 'https://mytotalconnectcomfort.com',
          'Referer': 'https://mytotalconnectcomfort.com/portal/Device/Control/' + deviceId,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: body
      }, function(err, response) {
        if (err || response.statusCode != 200 || response.statusMessage != "OK") {
          if (err) {
            if (DEBUG > 8) { console.log("Error: setHeatCoolSetpoint", err); }
            reject(err);
            return;
          } else {
            if (DEBUG > 8) { console.log("Error ", response.statusCode); }
            reject("HTTP Error = " + response.statusCode);
            return;
          }

        } else {
          var json;
          //    console.log(response.body);
          try {
            json = JSON.parse(response.body);
          } catch (ex) {
            //                console.error(ex);
            if (DEBUG > 8) {
              console.error(response.statusCode, response.statusMessage);
              console.error(response.body);
            //                console.error(response);
            }
            reject(ex);
            return;
          }
          if (json) {
            if (DEBUG > 8) { console.log("BODY:" + util.inspect(json,{depth: null, colors: true})); }
            resolve(json);
          }
        }
      });  // request
    }).catch((err) => {
      reject(err);
    });  // whenReady()
  });  // Promise
}

//---------------------------------------------------------------------------
// Function: setDeviceMode())
//   Set the device mode.
//   1 = Heat
//   2 = Off
//   3 = Cool
//   4 = Auto
//---------------------------------------------------------------------------
API.setDeviceMode = function(deviceId, mode) {
  if (DEBUG > 5) { console.log("setDeviceMode()"); }
  return new Promise((resolve,reject) => {
    var url = "https://mytotalconnectcomfort.com/portal/Device/SubmitControlScreenChanges";

    var body = JSON.stringify({
      "DeviceID": Number(deviceId),
      "SystemSwitch": Number(mode),
      "HeatSetpoint": null,
      "CoolSetpoint": null,
      "HeatNextPeriod": null,
      "CoolNextPeriod": null,
      "StatusHeat": null,
      "StatusCool": null,
      "FanMode": null
    });

    if (DEBUG > 8) {
      console.log(body);
    }

    API.whenReady().then(() => {
      request({
        method: 'POST',
        url: url,
        jar: jar,
        strictSSL: false,
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'Keep-Alive',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json; charset=UTF-8',
          'DNT': 1,
          'Host': 'mytotalconnectcomfort.com',
          'Origin': 'https://mytotalconnectcomfort.com',
          'Referer': 'https://mytotalconnectcomfort.com/portal/Device/Control/' + deviceId,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: body
      }, function(err, response) {
        if (err || response.statusCode != 200 || response.statusMessage != "OK") {
          if (err) {
            if (DEBUG > 8) { console.log("Error: setDeviceMode", err); }
            reject(err);
            return;
          } else {
            if (DEBUG > 8) { console.log("Error ", response.statusCode); }
            reject("HTTP Error = " + response.statusCode);
            return;
          }

        } else {
          var json;
          //    console.log(response.body);
          try {
            json = JSON.parse(response.body);
          } catch (ex) {
            //                console.error(ex);
            if (DEBUG > 8) {
              console.error(response.statusCode, response.statusMessage);
              console.error(response.body);
            //                console.error(response);
            }
            reject(ex);
            return;
          }
          if (json) {
            if (DEBUG > 8) { console.log("BODY:" + util.inspect(json,{depth: null, colors: true})); }
            resolve(json);
          }
        }
      }); // request
    }).catch((err) => {
      reject(err);
    });  // whenReady()
  });  // Promise
}
