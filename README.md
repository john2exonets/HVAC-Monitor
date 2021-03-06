# HVAC-Monitor
Publish Honeywell Total Comfort Thermostat readings via MQTT

Most of this code is taken from https://github.com/NorthernMan54/homebridge-tcc/blob/master/lib/tcc.js, but I did modify the code a bit to use Promises rather than call-backs, and changed to the code to reflect my coding style, but otherwise it is pretty much like the orginal.

The chkDataSession() returns a large JSON structure with a number of data points. I have Honeywell RTH6500 Thermostats, and a lot of what is returned didn't seem to apply to my units. The code supports an "Auto" mode for the thermostats, but since I don't think my units support it, I did not test it out. The code supports turning on Heat or Cool modes via MQTT messages 'hvac/heat/on' and 'hvac/cool/on'. If you use my [AlexaController](https://github.com/john2exonets/AlexaController) code, you can control your thermostats by voice commands!

The Honeywell Total Comfort Portal does seem to have a limit of one login every two minutes or so....trying to login quicker than that will return an HTTP 401 error. In the 'hvacmon.js' program, I only login once and just use a Node.JS timer to query the service every three minutes, and that seems to work fine. But....After running this for a while now, I did find that the login Auth Tokens seem to timeout after about three days, so I added some code that when the _request() function gets back a 401 error, it tries a re-login. That seems to do the trick, as I don't get anymore errors, and my container has been running for over a week now with no issues.

I have also provided another example program that sets the Heat temperature setpoint, and turns the Heat mode on.  There is also a way to turn the fan on/off/auto, but I didn't mess with that, so its not part of the module...but should not be hard to add. Maybe one day I'll come back and add that.

In my latest version, I added some 'Auto' code so that when certain temprature thresholds are reached, the program will signal the thermostats to change modes (IE> Heat to Cool, or Cool to Heat).  These thressholds are configurable in the 'config.json' file.

I wrote about this on my blog: https://diysmarthome.io/2020/03/control-honeywell-tc-thermostats-using-mqtt/ 
