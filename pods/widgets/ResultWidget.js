(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  beforeRequest: function () {
    //$(this.target).html($('<img>').attr('src', 'images/logos/ajax-loader.gif')).attr('style', 'text-align: center');
    $(this.target).html('<i class="fa fa-refresh fa-spin fa-5x"></i>').attr('style', 'text-align: center; color: ##273051');
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
    if (facet_values) {
      for (var i = 0, l = facet_values.length; i < l; i++) {
        if (facet_values[i] !== undefined) {
          links.push(
            $('<a href="#"></a>')
            .text(facet_values[i])
            .click(this.facetHandler(facet_field, facet_values[i]))
          );
        }
        else {
          links.push('no items found in current selection');
        }
      }
    }
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.manager.store.remove('fq');
      self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
      self.doRequest();
      return false;
    };
  },

  afterRequest: function () {
    $(this.target).removeAttr('style').empty();
    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
      var doc = this.manager.response.response.docs[i];
      $(this.target).append(this.template(this.manager.response, doc));
    }
  },

  template: function (response, currDoc) {
    var self = this;
    var output
    if (self.manager.collection === 'all') {
      return constructGenericTemplate(response, currDoc);
    } else if (self.manager.collection === 'ods') {
      return constructODSTemplate(response, currDoc, '');
    } else if (self.manager.collection === 'un') {
      return constructUNTemplate(response, currDoc, '');
    }
  },

  init: function () {
    $(document).on('click', 'a.more', function () {
      var $this = $(this),
          span = $this.parent().find('span');

      if (span.is(':visible')) {
        span.hide();
        $this.text('more');
      }
      else {
        span.show();
        $this.text('less');
      }

      return false;
    });
  }
});

})(jQuery);

function constructGenericTemplate(response, currDoc) {
    var collection = currDoc['[shard]'].substring(currDoc['[shard]'].lastIndexOf('/')+1, currDoc['[shard]'].length).toUpperCase();
    var output = '';
    if (collection === 'ODS') {
      output = constructODSTemplate(response, currDoc, collection);
    } else if (collection === 'UN') {
      output = constructUNTemplate(response, currDoc, collection);
    }
    return output;
}

function constructODSTemplate(response, currDoc, collection) {
    var body = '';
    var title = '';
    var snippet = '';
  
    body =   ((currDoc.languageCode === "other") ? currDoc['body_en']:currDoc['body_' + currDoc.languageCode]);
    title = ((currDoc.languageCode === "other") ? currDoc['title_en']:(currDoc['title_' + currDoc.languageCode] !== "") ? currDoc['title_' + currDoc.languageCode]: 'NO TITLE');
    var highlight = response.highlighting[currDoc.symbol + "_" + currDoc.languageCode];


    if(typeof highlight['body_' + currDoc.languageCode] !== 'undefined'){
      var hl = '';
      for (var i = 0; i < highlight['body_' + currDoc.languageCode].length; i++) {
        hl += highlight['body_' + currDoc.languageCode][i];
      }
      snippet = hl;
    } else {
      snippet += body.substring(0, 300);
    }

    var output = getConstructedItemODS(currDoc, title, snippet, body, collection); 
    return output;
}

function constructUNTemplate(response, currDoc, collection) {
    var body = '';
    var title = '';
    var snippet = '';
  
    body = ((currDoc.languageCode === "other") ? currDoc['body_en'] : currDoc['body_' + currDoc.languageCode]);
    title = ((currDoc.languageCode === "other") ? currDoc['title_en'] : (currDoc['title_' + currDoc.languageCode] !== "") ? currDoc['title_' + currDoc.languageCode]: 'NO TITLE');
    var highlight = response.highlighting[currDoc.id];


    if(typeof highlight['body_' + currDoc.languageCode] !== 'undefined'){
      var hl = '';
      for (var i = 0; i < highlight['body_' + currDoc.languageCode].length; i++) {
        hl += highlight['body_' + currDoc.languageCode][i];
      }
      snippet = hl;
    } else {
      snippet += body[0].substring(0, 300);
    }

    var output = getConstructedItemUN(currDoc, title, snippet, body, collection); 
    return output;
}


function getConstructedItemODS(doc, title, snippet, body, collection) {
    var pubDate = new Date(doc.publicationDate);
    var monthNames = getMonthNamesEng();
    var dateString = pubDate.getDate() + ' ' + monthNames[pubDate.getMonth()] + ' ' +  pubDate.getFullYear();

    var docSize = parseInt(doc.size);
    docSize = docSize / 1000000;

    var output = '<div class="row 0% uniform one-result">';
      output += getHeader('icon fa-file-pdf-o', docSize.toFixed(2), doc.url, doc.symbol.toUpperCase(), title.toUpperCase(), collection); 
      output += getExtraFunctions(doc.symbol, doc.languageCode, dateString, true, true, true, true, true);
      output +=  getSnippetBody(snippet, body);
      output +=  getInfoArea();
      output +=  buildAvailLangButtons();
    output +=  ' </div>';
    return output;
}

function getConstructedItemUN(doc, title, snippet, body, collection) {
    var pubDate = new Date(doc.dateCreated);
    var monthNames = getMonthNamesEng();
    var dateString = pubDate.getDate() + ' ' + monthNames[pubDate.getMonth()] + ' ' +  pubDate.getFullYear();

    var output = '<div class="row 0% uniform one-result">';
      output += getHeader('icon fa-file-text-o', '', doc.url, title[0].substring(0,80) + '...', decodeURIComponent(doc.url.substring(0,40)) + '...' + decodeURIComponent(doc.url.substring(doc.url.length-20)), collection); 
      output += getExtraFunctions(doc.id, dateString, true, false, true, false, true);
      output +=  getSnippetBody(snippet, body);
      output +=  getInfoArea();
    output +=  ' </div>';
    return output;
}

function getMonthNamesEng() {
  return [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
}

function getHeader(iconStyle, iconTooltip, u, t, st, c) {
  var title = '<div class="9u 8u(2)">';
      title += '<h1 style="font-size: 1em"><i class="' + iconStyle + '" title="' + iconTooltip + 'MB" style="color: #d8d8d8"></i>&nbsp;&nbsp;';
      if (c !== '') {
        title += '[' + c + ']&nbsp;-&nbsp;';
      }
      title += '<a href="#" onclick="return displayTextDirect(this, \'' + t + '\', \'' + u + '\');">' + t + '</a></h1><br />';
      if (st !== '') {
        title +=  '<h2 style="font-size: .8em">'+ st + '</h2>';
      }
    title +=  '</div>';
  return title;
}

function getExtraFunctions(itemId, itemLanguageCode, dd, vt, de, mlt, ls, sh) {
  var hide = "style='display: none;'";
  var extraFuncs = '<div class="3u$ 4u(2)">';
      extraFuncs +=  '<ul id="' + itemId + '"">';
      extraFuncs += '<li class="language">';
      extraFuncs +=  '<i class="icon fa-file-text-o" title="View" ' + ((vt) ? '' : hide) + ' onclick="return displayText(this);"></i>&nbsp;&nbsp;'; 
      extraFuncs += '<i class="icon fa-sitemap" title="ODS Reference Explorer" ' + ((de) ? '' : hide) + ' onclick="return getReferences(this, \''+ itemLanguageCode+'\');"></i>&nbsp;&nbsp;';
      extraFuncs += '<i class="icon fa-plus" title="More Like This" ' + ((mlt) ? '' : hide) + ' onclick="return getMLT(this);"></i>&nbsp;&nbsp;'; 
      extraFuncs += '<i class="icon fa-globe" title="Available Document Languages" ' + ((ls) ? '' : hide) + ' onclick="return getLanguages(this);"></i>&nbsp;&nbsp;'; 
      //extraFuncs += '<i class="icon fa-share-alt" title="Share" ' + ((sh) ? '' : hide) + ' onclick="return showShare(\'dialog-social\', \'noTitleStuff\');"></i></li>'; 
      extraFuncs +=  '<li class="date">' + dd + '</li>';
      extraFuncs +=  '</ul>';
    extraFuncs +=  '</div>';
  return extraFuncs;
}

function getSnippetBody(s, b) {
  var sb =  '<div class="12">';
        sb +=  '<p style="font-size: .8em">'+ s +'</p>';
      sb +=  '</div>';  
      sb +=  '<div class="12u 12u(2)" style="display:none;  word-wrap: break-word;">';
        sb +=  '<p style="font-size: .8em">'+ b +'</p>';
      sb +=  '</div>';
  return sb;
}

function getInfoArea() {
  return '<div class="12u 12u(2)" style="display:none; text-align: left; font-size: .8em; padding-top: 1em"></div>';
}

function buildAvailLangButtons() {
  var langs = '<div class="12u 12u(2)" style="display:none; text-align: right; padding-top: 1em">';
        langs += '<ul class="actions">';
          langs += '<li style="display: none"><a href="#" onclick="getLanguagesForSymbol(this, \'ar\');" class="button lang ar">عربي</a></li>';
          langs += '<li style="display: none"><a href="#" onclick="getLanguagesForSymbol(this, \'zh-cn\');" class="button lang cn">中文</a></li>';
          langs += '<li style="display: none"><a href="#" onclick="getLanguagesForSymbol(this, \'en\');" class="button lang en">English</a></li>';
          langs += '<li style="display: none"><a href="#" onclick="getLanguagesForSymbol(this, \'fr\');" class="button lang fr">Français</a></li>';
          langs += '<li style="display: none"><a href="#" onclick="getLanguagesForSymbol(this, \'ru\');" class="button lang ru">Русский</a></li>';
          langs += '<li style="display: none"><a href="#" onclick="getLanguagesForSymbol(this, \'es\');" class="button lang es">Español</a></li>';
        langs += '</ul>';
        langs +=  '</div>';
  return langs;
}