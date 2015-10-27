import Ember from 'ember';

var EmberTableWithGLData = Ember.Object.extend({
  groupingMetadata: [{id: "accountSection"}, {id: "accountType"}],
  loadChildren: Ember.computed(function() {
    var defers = this.get('defers');
    let totalCount = this.totalCount;
    let chunkSize = this.chunkSize;
    return () => {
      var defer = defers.next();
      var result = {
        content: [],
        meta: {totalCount, chunkSize}
      };
      for (var i = 0; i < chunkSize; i++) {
        result.content.push({id: i, "accountType": 'accountType-' + i});
      }
      defer.resolve(result);
      return defer.promise;
    };
  }),
  chunkSize: 5,
  totalCount: 5,
  defers: null
});

export default EmberTableWithGLData;
