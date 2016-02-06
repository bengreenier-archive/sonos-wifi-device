sonos-wifi-device
=================

> This is a script - as such it's pretty hardcoded, rough,
and not for production. use at your own risk.

toggle sonos playback based on wifi device availability

# Why

I want to pause my sonos when my iphone is off my wifi,
and resume when it comes back on.

# How

pings a device on the network every 5s and if doesn't
respond with 10m we pause. otherwise we play or keep playing.

clone this repo, `npm install`, `node index.js <ip>`, wait.

## Is this a perfect science?!

No...of course not this is mostly hacky garbage that should be
frowned upon. But I'm lazy and wanted to simulate TheRightWay__TM__
to solve this problem.

# License

MIT