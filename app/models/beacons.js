exports.definition = {
  config: {
    columns: {
      'id': 'integer primary key autoincrement',
      'name': 'text',
      'uuid': 'text',
      'major': 'integer',
      'minor': 'integer',
      'measuredPower': 'integer',
      'rssi': 'integer',
      'accuracy': 'real',
      'proximity': 'text',
      'detectTime': 'text'
    },
    adapter: {
      type: 'sql',
      collection_name: 'beacons',
      idAttribute: 'id'
    }
  },
  extendModel: function(Model) {
    _.extend(Model.prototype, {
      // extended functions and properties go here
    });

    return Model;
  },
  extendCollection: function(Collection) {
    _.extend(Collection.prototype, {
      // extended functions and properties go here

      // For Backbone v1.1.2, uncomment the following to override the
      // fetch method to account for a breaking change in Backbone.
      /*
       fetch: function(options) {
       options = options ? _.clone(options) : {};
       options.reset = true;
       return Backbone.Collection.prototype.fetch.call(this, options);
       }
       */
      // comparator : function(model) {
      //   return (0 - model.get('id'));
      // },
      deleteAll : function() {
        var collection = this;
        var sql = 'DELETE FROM ' + collection.config.adapter.collection_name;
        var db = Ti.Database.open(collection.config.adapter.db_name);
        db.execute(sql);
        db.close();

        collection.trigger('sync');
      }
    });

    return Collection;
  }
};
