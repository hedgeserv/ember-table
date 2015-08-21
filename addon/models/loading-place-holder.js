import Ember from 'ember';

var LoadingPlaceHolder = Ember.ObjectProxy.extend({
  isLoading: true,
  isLoaded: false,
  isError:false,
  contentLoadedHandler: Ember.K,
  contentLoaded: Ember.observer('content', function() {
    this.set('isLoaded', true);
    this.set('isLoading', false);
    var contentLoadedHandler = this.get('contentLoadedHandler');
    contentLoadedHandler.get('target').refreshControllerAt(contentLoadedHandler.index, this.get('content'));
  })
});

export default LoadingPlaceHolder;
