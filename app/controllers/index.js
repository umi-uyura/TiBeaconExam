'use strict';

var TiBeacon = require('tibeaconwrapper');
var moment = require('alloy/moment');
var dialogs = require('alloy/dialogs');

var setting = Alloy.Models.setting;
var beacons = Alloy.Collections.beacons;
var events = Alloy.Collections.events;

var progressTimer = null;

//
//
// functions
//
//

function setBeaconInfo(uuid, identifier, major, minor) {
  var beacon = {
    uuid: uuid,
    identifier: identifier
  };

  if (!_.isUndefined(major) && '' !== major) {
    beacon.major = parseInt(major);
  }

  if (!_.isUndefined(minor) && '' !== minor) {
    beacon.minor = parseInt(minor);
  }

  return beacon;
}

function notifyRegionEvent(e) {
  Ti.API.debug('index.js - notifyRegionEvent() = ' + JSON.stringify(e));

  var message = '';
  switch (e.type) {
  case 'enteredRegion':
    message = 'Entered Region';
    break;
  case 'exitedRegion':
    message = 'Exited Region';
    break;
  case 'determinedRegionState':
    if (e.regionState === 'inside') {
      message = 'Inside Region';
    }
    break;
  default:
    break;
  }

  if (message === '') {
    return;
  }

  Ti.API.debug('index.js - notifyRegionEvent() message = ' + message);

  if (OS_IOS) {
    Ti.App.Properties.setString('message', message);
    if(Ti.App.Properties.hasProperty('message')){
      Ti.App.iOS.cancelAllLocalNotifications();

      var msg = Ti.App.Properties.getString('message');
      var occurDate = new Date() /*new Date(new Date().getTime() + 5000)*/;

      var notifications = [];
      var notification_params = {
        alertBody: msg,
        userInfo: {
          alertMessage: msg,
          occurDate: occurDate
        },
        date: occurDate
      };
      notifications.push(Ti.App.iOS.scheduleLocalNotification(notification_params));
      Ti.App.Properties.removeProperty('message');
    }

  } else if (OS_ANDROID) {
    // TODO: implementation
  }
}

function recordEvents(eventname, e) {
  var event = Alloy.createModel('events', {
    time: moment().format('YYYY/MM/DD HH:mm:ss'),
    name: eventname,
    data: JSON.stringify(e)
  });

  events.add(event);
  event.save();
}

function handlerEnteredRegion(e) {
  Ti.API.debug('[enteredRegion] = ' + JSON.stringify(e));
  recordEvents('enteredRegion', e);
  notifyRegionEvent(e);
}

function handlerExitedRegion(e) {
  Ti.API.debug('[exitedRegion] = ' + JSON.stringify(e));
  recordEvents('exitedRegion', e);
  notifyRegionEvent(e);

  if (OS_IOS) {
    var beacon = setBeaconInfo(e.uuid, e.identifier, e.major, e.minor);
    TiBeacon.stopRangingForBeacons(beacon);
  } else if (OS_ANDROID) {
    TiBeacon.stopRangingForAllBeacons();
  }
}

function handlerDeterminedRegionState(e) {
  Ti.API.debug('[determinedRegionState] = ' + JSON.stringify(e));
  recordEvents('determinedRegionState', e);
  notifyRegionEvent(e);

  if (OS_ANDROID && _.isUndefined(e.uuid)) {
    e.uuid = setting.get('beaconUUID');
  }

  if (e.regionState === 'inside') {
    var beacon = setBeaconInfo(e.uuid, e.identifier, e.major, e.minor);
    TiBeacon.startRangingForBeacons(beacon);
  }
}

function handlerBeaconRanges(e) {
  Ti.API.debug('[beaconRanges] = ' + JSON.stringify(e));
  recordEvents('beaconRanges', e);
}

function handlerBeaconProximity(e) {
  Ti.API.debug('[beaconProximity] = ' + JSON.stringify(e));
  recordEvents('beaconProximity', e);

  var beacon = Alloy.createModel('beacons', {
    name: e.identifier,
    uuid: e.uuid,
    major: e.major,
    minor: e.minor,
    measuredPower: 0,
    rssi: e.rssi,
    accuracy: e.accuracy,
    proximity: e.proximity,
    detectTime: moment().format('YYYY/MM/DD HH:mm:ss')
  });

  beacons.add(beacon);
  beacon.save();
  beacons.fetch();
}

function addBeaconEventListener() {
  TiBeacon.addEventListener('enteredRegion', handlerEnteredRegion);
  TiBeacon.addEventListener('exitedRegion', handlerExitedRegion);
  TiBeacon.addEventListener('determinedRegionState', handlerDeterminedRegionState);
  TiBeacon.addEventListener('beaconRanges', handlerBeaconRanges);
  TiBeacon.addEventListener('beaconProximity', handlerBeaconProximity);
}

function removeBeaconEventListener() {
  TiBeacon.removeEventListener('enteredRegion', handlerEnteredRegion);
  TiBeacon.removeEventListener('exitedRegion', handlerExitedRegion);
  TiBeacon.removeEventListener('determinedRegionState', handlerDeterminedRegionState);
  TiBeacon.removeEventListener('beaconRanges', OS_IOS ? _.debounce(handlerBeaconRanges, 5000) : handlerBeaconRanges);
  TiBeacon.removeEventListener('beaconProximity', OS_ANDROID ? _.debounce(handlerBeaconProximity, 5000) : handlerBeaconProximity);
}

function doOpen() {
  activateBeacon();

  setting.fetch();
  beacons.fetch();
  events.fetch();

  if (OS_ANDROID) {
    var activity = $.index.getActivity();
    if(activity) {
      activity.invalidateOptionsMenu();
    }
  }
}

function doClose() {
  Ti.API.debug('index.js - doClose()');

  exitApp();
}

function exitApp() {
  Ti.API.debug('index.js - exitApp()');

  stopScan();
  removeBeaconEventListener();

  if (OS_ANDROID) {
    if (TiBeacon.beaconServiceIsBound()) {
      TiBeacon.unbindBeaconService();
    }
  }

  $.destroy();
}

function doClickSettings() {
  var idling = OS_IOS ? $.titleLabel.getVisible() : $.menuStart.isVisible();
  Alloy.createController('settings', {idling: idling}).getView().open({modal: true});
}

function doClickAction() {
  var isWaiting = $.titleLabel.getVisible();
  var actions = [
    isWaiting ? 'Start Scan' : 'Stop Scan',
    'Clear',
    'Cancel'
  ];

  var actionDialog = Ti.UI.createOptionDialog({
    title: 'Select action',
    options: actions,
    cancel: 2
  });

  actionDialog.addEventListener('click', doSelectAction);
  actionDialog.show();
}

function doSelectAction(e) {
  if (OS_IOS) {
    if (e.index === e.cancel) {
      return;
    }

    switch (e.index) {
    case 0:
      if ($.titleLabel.getVisible()) {
        doClickScan();
      } else {
        doClickStop();
      }
      break;
    case 1:
      doClickClear();
      break;
    default:
      break;
    }
  }
}

function doClickScan() {
  setting.fetch();

  if (OS_IOS) {
    $.titleLabel.hide();
    $.indicator.show();
  } else if (OS_ANDROID) {
    $.menuStart.setVisible(false);
    $.menuStop.setVisible(true);
    $.pb.show();

    progressTimer = setInterval(function() {
      if ($.pb.message === 'Scanning.....') {
        $.pb.message = 'Scanning';
      } else {
        $.pb.message = $.pb.message + '.';
      }
    }, 500);
  }

  startScan();
}

function doClickStop() {
  stopScan();

  if (OS_IOS) {
    $.indicator.hide();
    $.titleLabel.show();
  } else if (OS_ANDROID) {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    $.menuStart.setVisible(true);
    $.menuStop.setVisible(false);
    $.pb.hide();
  }
}

function doClickClear() {
  clearList();
}

function startScan() {
  var identifier = setting.get('beaconIdentifier');
  var uuid = setting.get('beaconUUID');
  var major = setting.get('beaconMajor');
  var minor = setting.get('beaconMinor');

  var beacon = setBeaconInfo(uuid, identifier, major, minor);
  TiBeacon.startMonitoringForRegion(beacon);
}

function stopScan() {
  TiBeacon.stopMonitoringAllRegions();
  TiBeacon.stopRangingForAllBeacons();
}

function clearList() {
  beacons.deleteAll();
  beacons.fetch();

  events.deleteAll();
  events.fetch();
}

function clickBeaconListItem(e) {
  var section = e.sectionIndex;
  var item = e.itemIndex;
  var beacon = beacons.at(item);
  alert(JSON.stringify(beacon, null, 2));
}

function clickEventListItem(e) {
  var section = e.sectionIndex;
  var item = e.itemIndex;
  var event = events.at(item);
  alert(JSON.stringify(event, null, 2));
}

function editPermissions(e) {

  if (OS_IOS) {
    Ti.Platform.openURL(Ti.App.iOS.applicationOpenSettingsURL);
  }

  if (OS_ANDROID) {
    var intent = Ti.Android.createIntent({
      action: 'android.settings.APPLICATION_SETTINGS'
    });
    intent.addFlags(Ti.Android.FLAG_ACTIVITY_NEW_TASK);
    Ti.Android.currentActivity.startActivity(intent);
  }
}

function activateBeacon() {
  // Let's include some related properties for iOS we already had
  if (OS_IOS) {
    // Available since Ti 5.0
    Ti.API.debug('Ti.Geolocation.allowsBackgroundLocationUpdates = ' + Ti.Geolocation.allowsBackgroundLocationUpdates);
    // Available since Ti 0.x, Always returns true on Android>2.2
    Ti.API.debug('Ti.Geolocation.locationServicesEnabled = ' + Ti.Geolocation.locationServicesEnabled);
  }

  if (TiBeacon.isBLESupported()) {
    Ti.API.error('BLE is supported on this device');
  } else {
    Ti.API.error('BLE isn\'t supported on this device');
  }

  // The new cross-platform way to check permissions
  // The first argument is required on iOS and ignored on other platforms
  var hasLocationPermissions = Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS);
  Ti.API.debug('Ti.Geolocation.hasLocationPermissions = ' + hasLocationPermissions);

  if (hasLocationPermissions) {
    Ti.API.debug(' Ti.Geolocation.hasLocationPermissions --> You already have permission.');
  }

  if (OS_IOS) {
    // Map constants to names
    var map = {};
    map[Ti.Geolocation.AUTHORIZATION_ALWAYS] = 'AUTHORIZATION_ALWAYS';
    map[Ti.Geolocation.AUTHORIZATION_AUTHORIZED] = 'AUTHORIZATION_AUTHORIZED';
    map[Ti.Geolocation.AUTHORIZATION_DENIED] = 'AUTHORIZATION_DENIED';
    map[Ti.Geolocation.AUTHORIZATION_RESTRICTED] = 'AUTHORIZATION_RESTRICTED';
    map[Ti.Geolocation.AUTHORIZATION_UNKNOWN] = 'AUTHORIZATION_UNKNOWN';
    map[Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE] = 'AUTHORIZATION_WHEN_IN_USE';

    // Available since Ti 0.8 for iOS and Ti 4.1 for Windows
    // Always returns AUTHORIZATION_UNKNOWN on iOS<4.2
    var locationServicesAuthorization = Ti.Geolocation.locationServicesAuthorization;
    Ti.API.debug('Ti.Geolocation.locationServicesAuthorization = Ti.Geolocation.' + map[locationServicesAuthorization]);

    if (locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
      Ti.API.error('Because permission are restricted by some policy which you as user cannot change, we don\'t request as that might also cause issues.');
    } else if (locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_DENIED) {
      dialogs.confirm({
        title: 'You denied permission before',
        message: 'We don\'t request again as that won\'t show the dialog anyway. Instead, press Yes to open the Settings App to grant permission there.',
        callback: editPermissions
      });
    }
  }

  // The new cross-platform way to request permissions
  // The first argument is required on iOS and ignored on other platforms
  Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {
    Ti.API.debug('Ti.Geolocation.requestLocationPermissions + ' + JSON.stringify(e));

    if (e.success) {
      // Instead, probably call the same method you call if hasLocationPermissions() is true
      Ti.API.info('You granted permission.');
    } else if (OS_ANDROID) {
      Ti.API.error('You denied permission for now, forever or the dialog did not show at all because it you denied forever before.');
    } else {

      // We already check AUTHORIZATION_DENIED earlier so we can be sure it was denied now and not before
      Ti.UI.createAlertDialog({
        title: 'You denied permission.',

        // We also end up here if the NSLocationAlwaysUsageDescription is missing from tiapp.xml in which case e.error will say so
        message: e.error
      }).show();
    }
  });

  if (OS_IOS) {
    TiBeacon.addEventListener('changeAuthorizationStatus', function(e){
      if (e.status !== 'authorized') {
        Ti.API.error('not authorized');
      }
    });

    TiBeacon.addEventListener('bluetoothStatus', function(e){
      if (e.status !== 'on') {
        Ti.API.error('bluetooth is not on');
      }
    });

    TiBeacon.requestBluetoothStatus();
  }

  if (OS_ANDROID) {
    TiBeacon.addBeaconLayout(TiBeacon.BEACON_LAYOUT_IBEACON);
    TiBeacon.bindBeaconService();
    if (!TiBeacon.checkAvailability()) {
      Ti.API.error('BLE isn\'t enabled on this device');
    }
  }
}

//
//
// main
//
//

if (OS_IOS) {
  Ti.App.iOS.addEventListener('notification', function(e) {
    Alloy.Globals.notifier.show(e.userInfo.alertMessage);
  });

  // Check if the device is running iOS 8 or later, before registering for local notifications
  if (Ti.Platform.name === 'iPhone OS' && parseInt(Ti.Platform.version.split('.')[0]) >= 8) {
    Ti.App.iOS.registerUserNotificationSettings({
      types: [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT]
    });
  }
}

addBeaconEventListener();
$.index.open();
