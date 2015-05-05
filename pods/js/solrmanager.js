var Manager;
var col;
var query;

(function ($) {

  $(function () {

    // Obtain the query parameters for collection and q
    col = getParameterByName('collection');
    query = getParameterByName('q');
    // Check if collection name is blank and default it
    if (col === '') {
      col = 'ods';
    }

    // Setup initial manager passing parameters
    Manager = new AjaxSolr.Manager({
      solrUrl: 'http://localhost:8983/solr',
      servlet: 'un_search',
      collection: col,
      rows: 50,
      sortField: 'publicationDate',
      idField: 'symbol'
    });

    // Add standard widgets
    Manager.addWidget(new AjaxSolr.ResultWidget({
      id: 'result',
      target: '#docs'
    }));

    Manager.addWidget(new AjaxSolr.PagerWidget({
      id: 'pager',
      target: '#pager',
      prevLabel: '&lt;',
      nextLabel: '&gt;',
      innerWindow: 1,
      renderHeader: function (perPage, offset, total) {
        $('#docCount').html('Results <strong>' + Math.min(total, offset + 1) + '</strong> to <strong>' + Math.min(total, offset + perPage) + '</strong> of <strong>' + total + '</strong> results for <strong>'+ (($('#query').val() !== '' ? $('#query').val(): '*:*')) +'</strong>. Search took ' + this.manager.response.responseHeader.QTime/1000 + ' seconds, for collection: <strong>' + this.manager.collection.toUpperCase() + '</strong>');
      }
    }));

    // Add UN specific widgets
    Manager.addWidget(new AjaxSolr.AdvancedSearchWidget({
      id: 'as',
    }));

    // Check the collection and add relevant widgets
    if (Manager.collection == "ods") {
      Manager.addWidget(new AjaxSolr.UNBodyWidget({
        id: 'unbody',
      }));
      Manager.addWidget(new AjaxSolr.ECWidget({
        id: 'ec',
      }));
    }
    if (Manager.collection == "un") {
      Manager.sortField = 'dateCreated';
      Manager.idField = 'id';
      Manager.addWidget(new AjaxSolr.EntitiesWidget({
        id: 'en',
      }));
    }
    if (Manager.collection == "all") {
      Manager.sortField = 'dateCreated';
      Manager.idField = 'id';
      Manager.addWidget(new AjaxSolr.CollectionWidget({
        id: 'co',
      }));
    }

    Manager.addWidget(new AjaxSolr.LanguageWidget({
      id: 'la',
    }));

    Manager.addWidget(new AjaxSolr.BubbleChartWidget({
      id: 'bubbles_topics',
      target: '#' + 'bubbles_topics',
      field: 'languageCode',
      diameter: 230,
      padding: 0.5
    }));

    Manager.init();
    if (query !== '') {
      Manager.store.addByValue('q', query);
    } else {
      Manager.store.addByValue('q', '*:*');
      Manager.store.addByValue('sort','score desc')
    }

    if (Manager.collection == "ods") {
      var params = getODSParams();
      for (var name in params) {
        Manager.store.addByValue(name, params[name]);
      }
    } else if (Manager.collection == "un") {
      var params = getUNParams();
      for (var name in params) {
        Manager.store.addByValue(name, params[name]);
      }      
    } else {
      var params = getGenericParams();
      for (var name in params) {
        Manager.store.addByValue(name, params[name]);
      }      
    }
    Manager.doRequest();
  });

})(jQuery);

function getODSParams() {
  var params = {
     facet: true,
    'facet.field': [ 'languageCode' ],
    'facet.limit': 20,
    'facet.mincount': 1,
    'f.topics.facet.limit': 50,
    'f.languageCode.facet.limit': -1,
    'fl': [ 'id', 'url', 'size', 'symbol','languageCode','publicationDate','title_en','title_fr','title_es','title_ru','title_ar','title_zh-cn','title_other','body_en','body_fr','body_es','body_ru','body_ar','body_zh-cn','body_other' ],      
    'json.nl': 'map',
    'mlt':true,
    'mlt.fl': ['title_en','title_es','title_ru','title_ar','title_fr','title_other','title_zh-cn']
  };
  return params;
}

function getUNParams() {
  var params = {
     facet: true,
    'facet.field': [ 'languageCode' ],
    'facet.limit': 20,
    'facet.mincount': 1,
    'f.topics.facet.limit': 50,
    'f.languageCode.facet.limit': -1,
    'fl': [ 'id', 'url','languageCode','dateCreated', 'title_en','title_fr','title_es','title_ru','title_ar','title_zh-cn','title_other','body_en','body_fr','body_es','body_ru','body_ar','body_zh-cn','body_other' ],      
    'json.nl': 'map',
    'mlt':true,
    'mlt.fl': ['title_en','title_es','title_ru','title_ar','title_fr','title_other','title_zh-cn']
  };
  return params;
}

function getGenericParams() {
  var params = {
    facet: true,
    'facet.field': [ '[shard]' ],
    'facet.limit': 20,
    'facet.mincount': 1,
    'fl': [ 'id','size','url','symbol','languageCode','publicationDate','dateCreated','score','[shard]','title_en','body_en','title_fr','body_fr','title_es','body_es','title_ru','body_ru','title_ar','body_ar','title_zh-cn','body_zh-cn','title_other','body_other' ],      
    'json.nl': 'map',
    'mlt':true,
    'mlt.fl': ['title_en','title_es','title_ru','title_ar','title_fr','title_other','title_zh-cn']
  };
  return params;
}
