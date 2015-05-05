(function (callback) {
  if (typeof define === 'function' && define.amd) {
    define(['core/AbstractManager'], callback);
  }
  else {
    callback();
  }
}(function () {

/**
 * @see http://wiki.apache.org/solr/SolJSON#JSON_specific_parameters
 * @class Manager
 * @augments AjaxSolr.AbstractManager
 */
AjaxSolr.Manager = AjaxSolr.AbstractManager.extend(
  /** @lends AjaxSolr.Manager.prototype */
  {

  init: function() {
    var self = this;
    self.initialized = true;
    if (self.store === null) {
      self.setStore(new AjaxSolr.ParameterStore());
    }
    self.store.load(false);
    for (var widgetId in self.widgets) {
      self.widgets[widgetId].init();
    }
    self.store.init();
  },

  executeRequest: function (servlet, collection, string, handler, errorHandler) {
    var self = this,
        options = {dataType: 'json'};
    string = string || this.store.string();
    handler = handler || function (data) {
      self.handleResponse(data);
    };
    errorHandler = errorHandler || function (jqXHR, textStatus, errorThrown) {
      self.handleError(textStatus + ', ' + errorThrown);
    };
    if (this.proxyUrl) {
      options.url = this.proxyUrl;
      options.data = {query: string};
      options.type = 'POST';
    }
    else {
      if (collection === 'all') {
        
      } else {
        options.url = this.solrUrl + '/' + collection + '/' + servlet + '?' + string + '&rows='+ this.rows + '&wt=json&json.wrf=?';

        
      }
    }
    jQuery.ajax(options).done(handler).fail(errorHandler);
    $('#query').val(getParameterByName('q'));
  }
});

}));
