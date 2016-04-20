var args = $.args;
var idling = args.idling;
var settingModel = Alloy.Models.setting;

function editableTextField(text, editable) {
  text.setEditable(editable);

  if (editable) {
    text.setColor('#000');
  } else {
    text.setColor('gray');
  }
}

function doSync(model, res, options) {
  $.settings.close();
}

function doOpen() {
  $.settingBeaconIdentifier.getView('text').value = settingModel.get('beaconIdentifier');
  $.settingBeaconUUID.getView('text').value = settingModel.get('beaconUUID');
  $.settingBeaconMajor.getView('text').value = settingModel.get('beaconMajor');
  $.settingBeaconMinor.getView('text').value = settingModel.get('beaconMinor');

  editableTextField($.settingBeaconIdentifier.text, idling);
  editableTextField($.settingBeaconUUID.text, idling);
  editableTextField($.settingBeaconMajor.text, idling);
  editableTextField($.settingBeaconMinor.text, idling);
}

function doClose() {
  $.destroy();
}

function doClickClose() {
  var model = {
    beaconIdentifier: $.settingBeaconIdentifier.getView('text').value,
    beaconUUID: $.settingBeaconUUID.getView('text').value,
    beaconMajor: $.settingBeaconMajor.getView('text').value,
    beaconMinor: $.settingBeaconMinor.getView('text').value
  };

  settingModel.save(model);
}

settingModel.on('sync', doSync);
settingModel.fetch();
