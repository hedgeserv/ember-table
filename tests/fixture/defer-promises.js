import Ember from 'ember';

export default Ember.Object.extend({
  next: function() {
    var defer = Ember.RSVP.defer();
    defer.promise.then(() => this.decrementProperty('pendingPromises', 1));
    this.incrementProperty('pendingPromises', 1);
    return defer;
  },


  pendingPromises: 0,

  waiterStates: [],

  ready: function (callback) {
    var prevWaitersCount = this.waiterStates.length;
    this.waiterStates.push('pending');
    return new Ember.RSVP.Promise((resolve) => {
      var watcher = setInterval(() => {

        if (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop) {
          return;
        }

        if (this.get('pendingPromises')) {
          return;
        }

        if (this.waiterStates.slice(0, prevWaitersCount).any(state => state === 'pending')) {
          return;
        }
        clearInterval(watcher);

        Ember.run(function () {
          callback();
          resolve();
        });
      }, 10);
    }).then(() => this.waiterStates[prevWaitersCount] = 'fulfilled');
  }
});
