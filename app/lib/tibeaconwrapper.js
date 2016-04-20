/**
 * TiBeaconWrapper
 *
 * Library that wraps the module in order to handle the iBeacon on multiple platforms
 *
 * Dependencies:
 *   iOS - Sensimity/TiBeacons (https://github.com/Sensimity/TiBeacons)
 *   Android - Sensimity/android-altbeacon-module (https://github.com/Sensimity/android-altbeacon-module)
 */

var tibeacon = null;

if (!tibeacon) {
  if (OS_IOS) {
    tibeacon = require('org.beuckman.tibeacons');
  } else if (OS_ANDROID) {
    tibeacon = require('com.drtech.altbeacon');
  }
}

if (!tibeacon) {
  Ti.API.error('TiBeacon isn\'t supported on this platform');
}

function warningNotSupport(funcname) {
  Ti.API.warning(funcname + ' isn\'t supported on this platform (' + Ti.Platform.osname + ')');
}

exports.BEACON_LAYOUT_IBEACON = 'm:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24';

exports.addEventListener = function(event, callback) {
  tibeacon.addEventListener(event, callback);
};

exports.removeEventListener = function(event, callback) {
  tibeacon.removeEventListener(event, callback);
};

exports.startMonitoringForRegion = function(region) {
  Ti.API.debug('TiBeaconWrapper.startMonitoringForRegion() - ' + JSON.stringify(region));
  tibeacon.startMonitoringForRegion(region);
};

exports.stopMonitoringAllRegions = function() {
  Ti.API.debug('TiBeaconWrapper.stopMonitoringAllRegions()');
  tibeacon.stopMonitoringAllRegions();
};

exports.startRangingForBeacons = function(region) {
  Ti.API.debug('TiBeaconWrapper.startRangingForBeacons() - ' + JSON.stringify(region));
  tibeacon.startRangingForBeacons(region);
};

exports.stopRangingForAllBeacons = function() {
  Ti.API.debug('TiBeaconWrapper.stopRangingForAllBeacons()');
  tibeacon.stopRangingForAllBeacons();
};

exports.isBLESupported = function() {
  Ti.API.debug('TiBeaconWrapper.isBLESupported()');
  return tibeacon.isBLESupported();
};

exports.checkAvailability = function() {
  Ti.API.debug('TiBeaconWrapper.checkAvailability()');

  if (OS_ANDROID) {
    return tibeacon.checkAvailability();
  } else {
    warningNotSupport('TiBeaconWrapper.checkAvailability()');
  }
};

exports.requestBluetoothStatus = function() {
  Ti.API.debug('TiBeaconWrapper.requestBluetoothStatus()');

  if (OS_IOS) {
    tibeacon.requestBluetoothStatus();
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.bindBeaconService = function() {
  Ti.API.debug('TiBeaconWrapper.bindBeaconService()');

  if (OS_ANDROID) {
    tibeacon.bindBeaconService();
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.unbindBeaconService = function() {
  Ti.API.debug('TiBeaconWrapper.unbindBeaconService()');

  if (OS_ANDROID) {
    tibeacon.unbindBeaconService();
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.beaconServiceIsBound = function() {
  Ti.API.debug('TiBeaconWrapper.beaconServiceIsBound()');

  if (OS_ANDROID) {
    return tibeacon.beaconServiceIsBound();
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.setBackgroundMode = function(flag) {
  Ti.API.debug('TiBeaconWrapper.setBackgroundMode() = ' + flag);

  if (OS_ANDROID) {
    tibeacon.setBackgroundMode(flag);
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.addBeaconLayout = function(layout) {
  Ti.API.debug('TiBeaconWrapper.addBeaconLayout() = ' + JSON.stringify(layout));

  if (OS_ANDROID) {
    tibeacon.addBeaconLayout(layout);
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.removeBeaconLayout = function(layout) {
  Ti.API.debug('TiBeaconWrapper.removeBeaconLayout() = ' + JSON.stringify(layout));

  if (OS_ANDROID) {
    tibeacon.removeBeaconLayout(layout);
  } else {
    warningNotSupport('TiBeaconWrapper.requestBluetoothStatus()');
  }
};

exports.setProximityBounds = function(bounds) {
  Ti.API.debug('TiBeaconWrapper.setProximityBounds() = ' + JSON.stringify(bounds));

  if (OS_ANDROID) {
    tibeacon.setProximityBounds(bounds);
  } else {
    warningNotSupport('TiBeaconWrapper.setProximityBounds()');
  }
};

exports.enableAutoRanging = function(bounds) {
  Ti.API.debug('TiBeaconWrapper.enableAutoRanging() = ' + JSON.stringify(bounds));

  if (OS_ANDROID) {
    tibeacon.enableAutoRanging();
  } else {
    warningNotSupport('TiBeaconWrapper.enableAutoRanging()()');
  }
};

exports.disableAutoRanging = function() {
  Ti.API.debug('TiBeaconWrapper.disableAutoRanging()');

  if (OS_ANDROID) {
    tibeacon.disableAutoRanging();
  } else {
    warningNotSupport('TiBeaconWrapper.disableAutoRanging()');
  }
};

exports.setAutoRange = function(autoRange) {
  Ti.API.debug('TiBeaconWrapper.setAutoRange() = ' + JSON.stringify(autoRange));

  if (OS_ANDROID) {
    tibeacon.setAutoRange(autoRange);
  } else {
    warningNotSupport('TiBeaconWrapper.setAutoRange()');
  }
};

exports.setRunInService = function(runInService) {
  Ti.API.debug('TiBeaconWrapper.setRunInService() = ' + JSON.stringify(runInService));

  if (OS_ANDROID) {
    tibeacon.setRunInService(runInService);
  } else {
    warningNotSupport('TiBeaconWrapper.setRunInService()');
  }
};

exports.isRunInService = function() {
  Ti.API.debug('TiBeaconWrapper.isRunInService()');

  if (OS_ANDROID) {
    tibeacon.isRunInService();
  } else {
    warningNotSupport('TiBeaconWrapper.isRunInService()');
  }
};

exports.setScanPeriods = function(scanPeriods) {
  Ti.API.debug('TiBeaconWrapper.setScanPeriods() = ' + JSON.stringify(scanPeriods));

  if (OS_ANDROID) {
    tibeacon.setScanPeriods(scanPeriods);
  } else {
    warningNotSupport('TiBeaconWrapper.setScanPeriods()');
  }
};

exports.startAdvertisingBeacon = function(param) {
  Ti.API.debug('TiBeaconWrapper.startAdvertisingBeacon() = ' + JSON.stringify(param));

  if (OS_IOS) {
    tibeacon.startAdvertisingBeacon(param);
  } else if (OS_ANDROID) {
    tibeacon.startBeaconAdvertisement(param);
  } else {
    warningNotSupport('TiBeaconWrapper.startAdvertisingBeacon()');
  }
};

exports.stopAdvertisingBeacon = function() {
  Ti.API.debug('TiBeaconWrapper.stopAdvertisingBeacon()');

  if (OS_IOS) {
    tibeacon.stopAdvertisingBeacon();
  } else if (OS_ANDROID) {
    tibeacon.stopBeaconAdvertisement();
  } else {
    warningNotSupport('TiBeaconWrapper.stopAdvertisingBeacon()');
  }
};
