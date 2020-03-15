//
//  turnHeatOn.js  -- Turn on the heat, plus set the temp for one unit.
//
//  John D. Allen
//  March, 2020
//

var HoneywellTotalComfort = require('./lib/honeywelltc.js');
var config = require('./config/config.json');

var DEBUG = true;

var opts = {
  "User": config.username,
  "Passwd": config.password,
  "DEBUG": config.debug
}

var htc = new HoneywellTotalComfort(opts);

htc.chkDataSession(config.devices[2].id).then((rr) => {
  var heatsp = rr.latestData.uiData.HeatSetpoint;
  var coolsp = rr.latestData.uiData.CoolSetpoint;
  htc.setHeatCoolSetpoint(config.devices[2].id, 71, coolsp, true).then((out) => {
    //console.log(JSON.stringify(out));
    if (out.success == 1) {
      htc.setDeviceMode(config.devices[2].id, htc.HEAT).then((out) => {
        if (out.success == 1) {
          console.log("Changes were successful.");
        } else {
          console.log("setDeviceMode(): Failed");
          console.log(JSON.stringify(out));
        }
      }).catch((err) => {
        console.log(err);
      });
    } else {
      console.log("setHeatCoolSetpoint(): Failed.")
      console.log(JSON.stringify(out));
    }
  }).catch((err) => {
    console.log(err);
  });  // setHeatCoolSetpoint()
}).catch((err) => {
  console.log(err);
}); // chkDataSession()
