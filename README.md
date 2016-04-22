TiBeaconExam
============

**Work in progress**

Examination app of iBeacon module for Titanium.
Attempt to sharing the api as much as possible in the iOS and Android.


Dependencies
------------

This project has the following dependencies in addition to the Titanium SDK.

### npm

* [Jade](http://jade-lang.com/) - View template engine for View XML
* [Stylus](http://stylus-lang.com/) - CSS preprocessor for TSS

The above packages are using in alloy.jmk. Therefore, it is necessary to be installed globally. ( `[sudo] npm install -g` )

\* if you do not want to use the Jade and Stylus, remove the alloy.jmk before to build. Because it contains View XML and TSS after compilation.


### iBeacon modules

* [Sensimity/TiBeacons](https://github.com/Sensimity/TiBeacons) v0.11.1 - iOS
    * Based on [jbeuckm/TiBeacons](https://github.com/jbeuckm/TiBeacons)
* [Sensimity/android-altbeacon-module](https://github.com/Sensimity/android-altbeacon-module) v1.4.0 - Android
    * Based on [dwk5123/android-altbeacon-module](https://github.com/dwk5123/android-altbeacon-module)

For module installation methods, refer to [the Appcelerator Document](https://docs.appcelerator.com/platform/latest/#!/guide/Using_a_Module) .

### Widgets

* [caffeinalab/ti.notifications](https://github.com/caffeinalab/ti.notifications)


Credit
------

* iBeacon module
    * iOS - [Sensimity/TiBeacons](https://github.com/Sensimity/TiBeacons)
    * Android - [android-altbeacon-module](https://github.com/Sensimity/android-altbeacon-module)
* iOS NavBar/Tab Icons - [icooon-mono](http://icooon-mono.com/)
