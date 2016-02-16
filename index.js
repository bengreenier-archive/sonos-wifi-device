var ds = require('device-status');
var Fsm = require('./fsm');

var deviceIp = process.argv[2] || process.env.DEVICE_IP || null;
var timeoutDelay = 10*1000*60; // every 10 minutes enable pausing
var resetDelay = 30*1000*60; // every 30 minutes set new default state

if (!deviceIp) {
    console.log("no deviceIp - exiting");
    process.exit(-1);
}

deviceIp = deviceIp.replace(" ", "");

console.log("using "+deviceIp+" as device ip");

var instance = new Fsm(function setup() {
    console.log("initial sonos reading: "+instance.getInitialState());
    
    var deviceState = false;
    var deviceStateWasGoodInLastInterval = false;
    ds(deviceIp).on("change", function (h, status) {
        // if we're not playing and our edge goes from missing to found
        // and we didn't start not playing, we play - yay logic
        if (instance.getInitialState() && !instance.getState() && !deviceState && status) {
            console.log("missing => found && !playing - triggering toggle");
            instance.toggle();
        }
        
        if (deviceState !== status) {
            console.log("device state changed from "+deviceState+" to "+status);
            deviceState = status;
        }
        if (status) {
            deviceStateWasGoodInLastInterval = true;
        }
    });
    
    setInterval(function () {
        // if we're playing and the device has been missing for >timeoutDelay
        // we pause
        if (!deviceStateWasGoodInLastInterval && instance.getState()) {
            console.log("found => missing && playing - triggering toggle");
            instance.toggle();
        }
        deviceStateWasGoodInLastInterval = false;
    }, timeoutDelay);
    
    var initialState = false;
    setInterval(function () {
        // reinit - in case we've manually changed sonos since last time
        instance.init(function () {
            // if there's actually a change, log it (preventing log spam)
            if (initialState !== instance.getInitialState()) {
                console.log("getting new inital sonos reading: "+instance.getInitialState());                
            }
            initialState = instance.getInitialState();
        });
    }, resetDelay);
});