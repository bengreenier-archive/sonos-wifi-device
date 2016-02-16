var sonos = require('sonos');

// ctor
function Fsm(setupCb) {
    var self = this;
    
    this._isSetup = false;
    this._state = null;
    this._initialState = null;
    this._statePending = false;
    this._device = null;
    
    findSonos(function (device) {
        device.getCurrentState(function (err, state) {
            if (!err) {
                self._isSetup = true;
                self._state = (state === "playing" ? true : false);
                self._initialState = (state === "playing" ? true : false);
                self._device = device;
                if (typeof(setupCb) === "function") {
                    setupCb(self);
                }
            }
        });
    });
}

// returns true if we're trying to toggle
// false if we don't even try
// note - this doesn't mean we're able to toggle
Fsm.prototype.toggle = function () {
    if (!this._isSetup || this._statePending) return false;
    
    if (this._state) {
        this._statePending = true;
        this._device.play(function (err) {
            if (!err) {
                this._state = true;
                this._statePending = false;
            }
        });
    } else {
        this._statePending = true;
        this._device.pause(function (err) {
            if (!err) {
                this._state = false;
                this._statePending = false;
            }
        });
    }
    
    return true;
}

Fsm.prototype.getState = function () {
    return this._state;
}

Fsm.prototype.getInitialState = function () {
    return this._initialState;
}

// export out sonos fsm
module.exports = Fsm;

//helper to get the `main` sonos instance
function findSonos(cb) {
    sonos.search(function(device) {
        // device is an instance of sonos.Sonos
        device.currentTrack(function (err, track) {
            // we determine the device to use by which device
            // has a track.title property
            if (!err && typeof(track.title) !== "undefined") {
                cb(device);
            }
        });
    });
}