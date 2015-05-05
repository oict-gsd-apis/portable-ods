/*
* Author: Kevin Thomas Bradley
* Date: 12-Jan-2015
* Description: Enterprise Search Page
*/
var progressbar;
var progressLabel;
var isOffline = true;
var langDoc;

$(function() {
  
    $.ajax({
        type: "GET",
        url: "langs/en.xml",
        dataType: "xml",
        success: function(data){
          langDoc = $( data );
        }
    });

    progressbar = $( "#progressbar" );
    progressLabel = $( ".progress-label" );

    $('#query').on('keyup', function(e) {
      if (e.which == 13) {
        e.preventDefault();
        var search = new AjaxSolr.Search({
          inputField: 'query',
          sort: 'sort desc',
          rows: 50,
        }).performSearch();
        window.history.pushState("", "", "?collection=" + encodeURIComponent($("#collectionType").val()) + "&q=" + encodeURIComponent($("#query").val()));
      }
    });

 
    progressbar.progressbar({
      value: false,
      change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
      },
      complete: function() {
        progressLabel.text( "Complete!" );
      }
    });

    $(document).delegate( "#abortButton","click",function(){
      var abort = new AjaxSolr.AjaxCall({
          type: "GET",
          url: Manager.solrUrl + "/" + Manager.collection + "/replication?command=abortfetch",
          contentType: "text/xml; charset=utf-8",
          async: false,
          dataType: "xml"
      }).makeAjaxCall(function(data) {
        var acode = $(data).find("str[name='status']").text();;
        if (acode === "OK") {
          
        }
      });
    });

    $.ajax({
            type: "GET",
            url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&callback=?&page=United_Nations',
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            success: function (data, textStatus, jqXHR) {
              $('#replicateButton').show();
              isOffline = false;
              $(document).delegate( "#replicateButton","click",function(){
                var wiki = new AjaxSolr.AjaxCall({
                    type: "GET",
                    url: Manager.solrUrl + "/" + Manager.collection + "/replication?command=fetchindex",
                    contentType: "text/xml; charset=utf-8",
                    async: false,
                    dataType: "xml"
                }).makeAjaxCall(function(data) {
                  var code = $(data).find("str[name='status']").text();;
                  if (code === "OK") {
                    progressbar.progressbar( "value", 0 );
                    openDialog('dialog-replicate');
                    setTimeout(function(){ 
                      resetTimeout(1000);
                    }, 1000);
                  }
                });
              });
            },
            error: function (errorMessage) {
              isOffline = true;
              $('#replicateButton').hide();
            }
        }); 


    // Declare variables for size of dialogs
    var wWidth = $(window).width();
    var dWidth = wWidth * 0.8;
    var wHeight = $(window).height();
    var dHeight = wHeight * 0.8;

    $("#collectionType").change(function() {
      window.location.search = "?collection=" + encodeURIComponent($("#collectionType").val()) + '&q=' + encodeURIComponent($("#query").val());
    });

    $('#collectionType').val(getParameterByName('collection'));

    // Build the button clicks
    buildSearchButtonClick('srchButton', 'query', 'score desc', 50, function() { getUNInfo('query'); });
    buildFilterButtonClick('srchButtonAS', 'query', 'score desc', 50, 'as', function() {});
    buildFilterButtonClick('sortDate', 'query', Manager.sortField + ' desc', 50, '', function() {
      $('#sortRel').html("Sort by: <a href='' id='sortRelevance'>Relevance </a> | Date </span><br />");
    });
    buildFilterButtonClick('sortRelevance', 'query', 'score desc', 50, '', function() {
      $('#sortRel').html("Sort by: Relevance | <a href='' id='sortDate'>Date </a></span><br />");
    });

    // Build the dialog boxes
    buildDialog('dialog-visual', dWidth, dHeight, false, true);
    buildDialog('dialog-social', 370, 130, false, true);
    buildDialog('dialog-message', dWidth, dHeight, false, true);
    buildDialog('dialog-guide', dWidth, dHeight, false, true);
    buildDialog('dialog-replicate', 420, 320, false, true);

    // Create the classes
    AjaxSolr.AjaxCall = AjaxSolr.Class.extend(
      {
      constructor: function (attributes) {
        AjaxSolr.extend(this, {
          type: "GET",
          url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&callback=?&page=United_Nations',
          contentType: "application/json; charset=utf-8",
          async: false,
          dataType: "jsonp"
        }, attributes);
      },

      makeAjaxCall: function( dataHandler ) {
        $.ajax({
            type: this.type,
            url: this.url,
            contentType: this.contentType,
            async: this.async,
            dataType: this.dataType,
            success: function (data, textStatus, jqXHR) {
                dataHandler(data);
            },
            error: function (errorMessage) {
              alert(errorMessage);
            }
        }); 
      },

      init: function () {
        var self = this;

        if (!this.url) {
          throw '"url" must be set on AJAX Call.';
        }
      }
    });

    AjaxSolr.Search = AjaxSolr.Class.extend({
      constructor: function (attributes) {
        AjaxSolr.extend(this, {
          inputField: "query",
          rows: "50",
          sort: "score desc"
        }, attributes);
      },

      performSearch: function( ) {
        var value = $('#' + this.inputField ).val();
        if (value) {
            self.Manager.store.addByValue('q', value );
            self.Manager.store.addByValue('rows',this.rows);
            self.Manager.store.addByValue('sort',this.sort);
            self.Manager.doRequest();
        }
        $('#' + this.inputField ).val(value);
      },

      filterSearch: function(query) {
          var value = $('#' + this.inputField ).val();
          var tmpvalue = value + ((query !== '' ? ((value !== '' ? ' AND ' : '')) + query: ''))
          self.Manager.store.addByValue('q', (tmpvalue)? tmpvalue: '*:*' );
          self.Manager.store.addByValue('rows',this.rows);
          self.Manager.store.addByValue('sort',this.sort);
          self.Manager.doRequest();
          $('#' + this.inputField ).val(value);
      },

      init: function () {
        var self = this;
      }    
    });

    AjaxSolr.Languages = AjaxSolr.Class.extend({
      constructor: function (attributes) {
        AjaxSolr.extend(this, {
        }, attributes);
      },

      getLanguages: function(symbol, element) {
        var store = new AjaxSolr.ParameterStore();
        
        store.addByValue('q', 'symbol:("' + symbol + '")');

        self.Manager.executeRequest('un_search', self.Manager.collection, store.string(), function (data) {
          var doc = '';
          var size = data.response.docs.length;
          for (var i = 0; i < size; i++) {
            if (data.response.docs[i].languageCode === "ar") {
              $(element).children('ul').children('li:nth-child(1)').show();
            }
            if (data.response.docs[i].languageCode === "zh-cn") {
              $(element).children('ul').children('li:nth-child(2)').show();
            }
            if (data.response.docs[i].languageCode === "en") {
              $(element).children('ul').children('li:nth-child(3)').show();
            }
            if (data.response.docs[i].languageCode === "fr") {
              $(element).children('ul').children('li:nth-child(4)').show();
            }
            if (data.response.docs[i].languageCode === "ru") {
              $(element).children('ul').children('li:nth-child(5)').show();
            }
            if (data.response.docs[i].languageCode === "es") {
              $(element).children('ul').children('li:nth-child(6)').show();
            }
            doc += ' ' + data.response.docs[i].languageCode;
          }
        });
      },

      init: function () {
        var self = this;
      }    
    });

    AjaxSolr.MoreLikeThis = AjaxSolr.Class.extend({
      constructor: function (attributes) {
        AjaxSolr.extend(this, {
        }, attributes);
      },

      getMLT: function(id, element) {
        var store = new AjaxSolr.ParameterStore();
        var searchQuery = $('#query').val();
        if (searchQuery === '')
          store.addByValue('q', '*:*');
        else
          store.addByValue('q', searchQuery);
        store.addByValue('mlt', 'true');
        store.addByValue('mlt.fl', 'title_en,title_fr,title_es,title_ru,title_ar,title_zh-cn');

        self.Manager.executeRequest('un_search', self.Manager.collection, store.string(), function (data) {
          var size = data.response.docs.length;
          if (size > 1) {
            for (var i = 0; i < size; i++) {
              var currDoc = data.response.docs[i];
              if (id === ((self.Manager.collection === 'ods') ? currDoc.symbol : currDoc.id)) {
                var mlt = '';
                if (self.Manager.collection === 'ods') {
                  mlt = data.moreLikeThis[currDoc.symbol + '_' + currDoc.languageCode];
                } else {
                  mlt = data.moreLikeThis[currDoc.id];
                } 
                var sizeMLT = mlt.docs.length;
                if (sizeMLT > 1) {
                  var mltDocs = '<strong>More Like This:</strong><br /><ul style="list-style-type: circle;">';
                  for (var j = 0; j < sizeMLT; j++) {
                    var startUrl = "http://www.un.org/ga/search/view_doc.asp?symbol=" + mlt.docs[j].url.substring(mlt.docs[j].url.indexOf("DS=")+3, mlt.docs[j].url.length);
                    if (mlt.docs[j].languageCode === "ar") {
                      mltDocs += '<li><a href="' + startUrl + '">' + mlt.docs[j].title_ar.toString().substring(0, 100); + ' ...</a></li>';
                    }
                    if (mlt.docs[j].languageCode === "zh-cn") {
                      mltDocs += '<li><a href="' + startUrl + '">' + mlt.docs[j]['title_zh-cn'].toString().substring(0, 100); + ' ...</a></li>';
                    }
                    if (mlt.docs[j].languageCode === "en") {
                      mltDocs += '<li><a href="' + startUrl + '">' + mlt.docs[j].title_en.toString().substring(0, 100); + ' ...</a></li>';
                    }
                    if (mlt.docs[j].languageCode === "fr") {
                      mltDocs += '<li><a href="' + startUrl + '">' + mlt.docs[j].title_fr.toString().substring(0, 100); + ' ...</a></li>';
                    }
                    if (mlt.docs[j].languageCode === "ru") {
                      mltDocs += '<li><a href="' + startUrl + '">' + mlt.docs[j].title_ru.toString().substring(0, 100); + ' ...</a></li>';
                    }
                    if (mlt.docs[j].languageCode === "es") {
                      mltDocs += '<li><a href="' + startUrl + '">' + mlt.docs[j].title_es.toString().substring(0, 100); + ' ...</a></li>';
                    }
                  }
                  mltDocs += '</ul>';
                  $(element).html(mltDocs);
                } else {
                  $(element).html('<strong>More Like This:</strong> - No related documents found.');
                }
              }
            }
          } else {
            $(element).html('<strong>More Like This:</strong> - No related documents found.');
          }
          $('#query').val(searchQuery);
        });
      },

      init: function () {
        var self = this;
      }    
    });

    AjaxSolr.References = AjaxSolr.Class.extend({
        constructor: function (attributes) {
            AjaxSolr.extend(this, {
            }, attributes);
        },

        getReferencing: function(symbol, language) {
            $("#dialog-visual").empty();
            var store0 = new AjaxSolr.ParameterStore();
            var d0 = '';
            store0.addByValue('q', 'symbol:' + symbol + ' AND languageCode:' + language);
            store0.addByValue('fl', 'refGA,url,size,symbol,languageCode,publicationDate' );
            self.Manager.executeRequest('un_search', self.Manager.collection, store0.string(), function (data) {
                d0 = data;
                var store1 = new AjaxSolr.ParameterStore();
                var d1 = '';
                var qString = 'symbol:(';
                var symbols = [];
                if (data.response.docs[0].refGA != null) {
                  data.response.docs[0].refGA.forEach(function(d){
                      qString += d+ ' OR ';
                  })
                }
                qString = qString.substr(0, qString.length-4) + ')  AND languageCode:'+ language;

                store1.addByValue('q', qString );
                store1.addByValue('fl', 'id,url,symbol,languageCode,publicationDate' );
                self.Manager.executeRequest('un_search', self.Manager.collection, store1.string(), function (data) {
                    d1 = data;
                    var store2 = new AjaxSolr.ParameterStore();
                    var d2 = '';
                    store2.addByValue('q', 'refGA:' +  symbol.replace('?','') + ' AND languageCode:'+ language);
                    store2.addByValue('fl', 'id,symbol,refGA,url,size,symbol,languageCode,publicationDate' );
                    self.Manager.executeRequest('un_search', self.Manager.collection, store2.string(), function (data) {
                        d2 = data;
                        buildReferenceVis(d0, d1, d2);
                    });
                });
            });
        },

        init: function () {
            var self = this;
        }
    });

});

function resetTimeout(val) {
  setTimeout(function(){ 
    var tp;
    var tpi;
    var tri;
    var details = new AjaxSolr.AjaxCall({
          type: "GET",
          url: Manager.solrUrl + "/" + Manager.collection + "/replication?command=details",
          contentType: "text/xml; charset=utf-8",
          async: false,
          dataType: "xml"
      }).makeAjaxCall(function(data) {
        tp = $(data).find("str[name='totalPercent']").text();
        var tr = $(data).find("str[name='timeRemaining']").text();
        tr = tr.replace("s", "");
        var speed = $(data).find("str[name='downloadSpeed']").text();
        tpi = ((tp !== "") ? parseInt(tp) : 100);
        if (tr !== "") {
          var trSeconds = parseInt(tr);
          var trMinutes = Math.round(trSeconds / 60);
          var trHours = Math.round(trMinutes / 60);
          var trDays = Math.round(trHours / 24);
          if (trDays > 1)
            tri = trDays + ' days';
          else if (trHours > 1) 
            tri = trHours + ' hours';
          else if (trMinutes > 1)
            tri = trMinutes + ' minutes';
          else
            tri = trSeconds + ' seconds';
        }
        $("#cTime").text(tri);
        $("#cSpeed").text(speed);
        progressbar.progressbar( "value",  tpi);
      });
    if (tp !== "")
      resetTimeout(val);
    else {
      $('#dialog-replicate').dialog('close'); 
      window.location.search = "?collection=" + encodeURIComponent($("#collectionType").val()) + '&q=' + encodeURIComponent($("#query").val());
     }
  }, val);
}

/*
 * GENERALISED FUNCTIONS
 */
 function getLanguageElement(name){
    $val = langDoc.find( name );
    alert($val.text());
 }

// Function which builds a search button click
function buildSearchButtonClick(id, ifield, s, r, postFunction) {
  $(document).delegate( "#" + id,"click",function(){
    var search = new AjaxSolr.Search({
        inputField: ifield,
        sort: s,
        rows: r,
    }).performSearch();
    if (typeof postFunction !== 'undefined') {
      window.history.pushState("", "", "?collection=" + encodeURIComponent($("#collectionType").val()) + "&q=" + encodeURIComponent($("#query").val()));
      postFunction();
    }
  });
}

// Function which builds a filter button click
function buildFilterButtonClick(id, ifield, s, r, typeObj, postFunction) {
  $(document).delegate( "#" + id,"click",function(){
      if (typeObj === 'as') {
        s = $("#sortby").val();
        r = $("#resultsperpage").val();
      }
      var search = new AjaxSolr.Search({
          inputField: ifield,
          sort: s,
          rows: r,
      }).filterSearch(buildASquery());
      postFunction();
  });
}

// Function which builds a default dialog box
function buildDialog(id, w, h, ao, m) {
  var dia = $("#" + id);
  dia.dialog({
    autoOpen: ao,
    modal: m,
    width: w,
    height: h,
    resizable: false,
    dialogClass: 'no-close success-dialog',
    buttons: [{text: "Close", click: function() {$(this).dialog("close")}}],
    show: {
        effect: "blind",
        duration: 500
    },
    hide: {
        effect: "fade",
        duration: 500
    }
  });
}

// Function used to enable or disable a checkbox that starts with two characters
function checkboxEnableDisable(value, firstTwoCharacters){
  $("input[type=checkbox]").each(function() {
      if ($(this).attr('name').substring(0, 2) === firstTwoCharacters) {
        $(this).prop('checked', true);
        $(this).prop('disabled', value);
      }
  });
}

// Function used to enable or disable an element
function disableEnableElement(id, disabled) {
  $("#" + id).prop('disabled', disabled);
  $("#" + id).attr('disabled', disabled);
}

// Function which obtains the query parameters
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Function to update the query string parameter
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  uri = uri.replace("#", "");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

function searchViaQueryString(val) {
  //window.location);
  var newUrl = updateQueryStringParameter(window.location.href, 'q', val);
  window.location = newUrl;
  return false;
}

// Function which simply expands or contracts the elements siblings
function expandUnorderdList(id, elementType) {
    $( id ).siblings( elementType ).toggle();
    if ($(id).attr('class') == 'icon fa-chevron-right') {
      $( id ).removeClass('icon fa-chevron-right');
      $( id ).addClass('icon fa-chevron-down');
    } else {
      $( id ).removeClass('icon fa-chevron-down');
      $( id ).addClass('icon fa-chevron-right');      
    }
}

// Function which closes sliding a parent container and cleans the sibling elements
function closeSlidingEmptyContainer(parentId, elementIds) {
    $("#" + parentId).slideUp( "slow" );
    for (var i = 0; i < elementIds.length; i++){
      $("#" + elementIds[i]).empty();
    }
}

// Function which empties a collection of elements
function setEmptyValue(ids) {
    for (var i = 0; i < ids.length; i++){
      $("#" + ids[i]).val('');
    }
}

// Function which sets a default field for a collection of elements
function setDefaultValue(ids, value) {
    for (var i = 0; i < ids.length; i++){
      $("#" + ids[i]).val(value);
    }
}
// Function to toggle and element
function toggleElement(element) {
  $(element).toggle();
}

// Function to open a dialog with the id
function openDialog(id) {
  $('#' + id).dialog( 'open' );
}

function addCSS(id, key, value) {
  $('#' + id).css(key, value);
}

function removeCSS(id) {
  $('#' + id).removeAttr('style');
}

/*
 * SPECIALISED FUNCTIONS
 */ 

// Function to get a specific search items Id from the results constructed
function getItemId(element) {
  return $(element).parent().parent().attr("id");
}

 // Function to get the wiki information for an item
function getWiki(name) {
    var wiki = new AjaxSolr.AjaxCall({
        type: "GET",
        url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&callback=?&page=' + name,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json"
    }).makeAjaxCall(function(data) {
      var markup = data.parse.text["*"];
      var title = data.parse.title;
      var content = $('#wiki').html(markup);
      var image = content.find('table.infobox.vcard img:first');
      var contentImg = $('#wikiImg').html(image);
      content.find('table').remove();
      content.find('ol').remove();
      var firstPara = content.find('p:first');
      $('#' +  this.divName).html(firstPara);
      content.find('p:gt(0)').remove(); 
      content.find('img.thumbimage').remove();  
      content.find('img.thumbborder').remove();
      content.find('div.thumbcaption').remove();        
      content.find('blockquote').remove();       

      // Remove links as they will not work
      content.find('a').each(function() { $(this).replaceWith($(this).html()); });

      $("#informat").slideDown( "slow" );
    });
}

function getUNInfo(qField) {
    var store = new AjaxSolr.ParameterStore();
    
    store.addByValue('q', $('#' + qField).text());

    self.Manager.executeRequest('un_search', "un_info", store.string(), function (data) {
      var doc = '';
      var size = data.response.docs.length;
      var htmlString = "";
      var count = 0;
      if (size > 0) {
        htmlString += "<ul style=\"color: #555656; font-size: .8em;\">";
        for (var i = 0; i < size; i++) {
          if (typeof data.response.docs[i].body_en !== 'undefined') {
            if (count === 5)
              break;
            htmlString += "<li id=" + data.response.docs[i].id + " onclick=\"getUNEntityInfo(" + data.response.docs[i].id + ");\"><a href=\"#\" onclick=\"\">" + data.response.docs[i].title_en + "</a></li>";
            count++;
          }
        }
        htmlString += "</ul>";
        $("#unInfoBody").html(htmlString);
      }
    });
}

function getUNEntityInfo(id) {
    var store = new AjaxSolr.ParameterStore();
    
    store.addByValue('q', 'id:' + id);

    self.Manager.executeRequest('un_search', "un_info", store.string(), function (data) {
      closeSlidingEmptyContainer('informat', new Array('informatUN'));
      var doc = '';
      var size = data.response.docs.length;
      var htmlString = "";
      var count = 0;
      if (size > 0) {
          htmlString += "<div class=\"6u 12u(2)\">";
          htmlString += "<p>";
          htmlString += "<span id=\"wikiImg" + i + "\" class=\"image left\"><img src=\"images/blue-un-logo-vectorised-hi.png\" alt=\"Image A\" /><span>";
          htmlString += "<div id=\"wiki" + i + "\" style=\"color: ##555656; font-size: .8em; margin: 0 0 0 0; overflow: hidden;\">";
          htmlString += "<strong>" + data.response.docs[0].title_en + "</strong>";
          htmlString += "<br />";
          htmlString += data.response.docs[0].category;
          htmlString += "<br />";
          htmlString += data.response.docs[0].body_en + "... " + "<span id=\"more" + i + "\" style=\"color: ##555656; font-size: .8em; margin: 0 0 0 0;\"><a href=\"" + data.response.docs[0].url + "\">More...</a><span>";
          htmlString += "</div>";
          htmlString += "</p>";
          htmlString += "</div>";
          count++;
        }
        $('#informatUN').html(htmlString);
        $("#informat").slideDown( "slow" );
    });
}

// Function used to toggle the Advanced Search pane, enabling or disabling as required
function toggleAS(id) {
    if ($("#asToggleButton").attr('class') === "icon fa-toggle-on fa-2x") {
        $("#asText").text('Open Advanced Search');
        $("#asToggleButton").attr("class","icon fa-toggle-off fa-2x");
        $("#advanced").slideUp( "slow" );
        // Enable main search elements
        disableEnableElement('query', false);
        disableEnableElement('srchButton', false);
        checkboxEnableDisable(false, 'ch');
        // Reset the default values
        setEmptyValue(new Array('ASwords', 'ASexact', 'ASatleast', 'ASwithout'));
        setDefaultValue(new Array('term_occurs', 'language', 'doctype'), '*');
        setDefaultValue(new Array('resultsperpage'), 10);
        setDefaultValue(new Array('sortby'), 'score desc');
    } else {
        $("#asText").text('Close Advanced Search');
        $("#asToggleButton").attr("class","icon fa-toggle-on fa-2x");
        $("#advanced").slideDown( "slow" );
        setEmptyValue(new Array('query'));
        // Disable main search elements
        disableEnableElement('query', true);
        disableEnableElement('srchButton', true);
        checkboxEnableDisable(true, 'ch');
    }
}

// Function - entry function for references for an item
function getReferences(element, languageCode) {
    var referencing = new AjaxSolr.References().getReferencing(getItemId(element), languageCode);
    openDialog('dialog-visual');
    return false;
}

// Function - entry function for languages for an item
function getLanguages(element) {
    var info = $(element).parent().parent().parent().siblings().last();
    var search = new AjaxSolr.Languages().getLanguages(getItemId(element), info);
    toggleElement(info);
}

// Function - entry function for more like this for an item
function getMLT(element) {
    var info = $(element).parent().parent().parent().siblings().next().next().next().next();
    var mlt = new AjaxSolr.MoreLikeThis().getMLT(getItemId(element), info)
    toggleElement(info);
}

// Function to show the share dialog
function showShare(id, dialogClass) {
    $('#' + id).dialog('option', 'dialogClass', dialogClass);
    openDialog(id);
}

// Function to display Full text
function displayText(element) {
    var dialogName = 'dialog-message';
    //addCSS(dialogName, 'white-space', 'pre');
    var info = $(element).parent().parent().parent().siblings().next().next().next();
    $('#' + dialogName).html('<a href="#" id="compactText" class="button" style="float: right">Compact</a>').append(info.html());
    $('#' + dialogName).dialog('option', 'title', 'Full Text for: ' + getItemId(element));
    openDialog(dialogName);
    $( "#compactText" ).click(function() {
        if ($( "#compactText" ).text() === "Compact") {
            //emoveCSS(dialogName);
            document.getElementById("dialog-message").style.removeProperty('white-space');
            //addCSS(dialogName, 'overflow', 'scroll');
            $("#compactText" ).text('Expand');
        } else  {
            $("#compactText" ).text('Compact');
            $("#dialog-message").css("white-space","pre");
            //addCSS(dialogName, 'white-space', 'pre');
        }
    });
}

function displayTextDirect(element, id, url) {
    if (!isOffline) {
      var endOfUrl = url.substring(url.indexOf("DS=")+3, url.length);
      var win = window.open("http://www.un.org/ga/search/view_doc.asp?symbol=" + endOfUrl, '_blank');
      win.focus();
    } else {
      var dialogName = 'dialog-message';
      //addCSS(dialogName, 'white-space', 'pre');
      var info = $(element).parent().parent().siblings().next().next();
      $('#' + dialogName).html('<a href="#" id="compactText" class="button" style="float: right">Compact</a>').append(info.html());
      $('#' + dialogName).dialog('option', 'title', 'Full Text for: ' + id);
      openDialog(dialogName);
      $( "#compactText" ).click(function() {
        if ($( "#compactText" ).text() === "Compact") {
            document.getElementById("dialog-message").style.removeProperty('white-space');
            $("#compactText" ).text('Expand');
        } else  {
            $("#compactText" ).text('Compact');
            $("#dialog-message").css("white-space","pre");
        }
      });
    }
}

// Function to add the filter to the query on click
function addRemoveFilter(chkObject, group, parent) {
    //if the parent node is checked the child nodes will be checked
    if (group != "")
        cbChangegroup(chkObject, group);
    //if one of the child nodes is checked it will check the parent node
    if (parent != ""){
        var parentnode = $('#' + parent);
        $(parentnode).prop('checked', true);
        cbcheckParent(parent);
    }
    var search = new AjaxSolr.Search().filterSearch(buildquery());
}

function getLanguagesForSymbol(element, language) {
  var symb = $(element).parent().parent().parent().parent().children(0).children(0).siblings().find('a').text();
  var query = 'symbol:("' + symb + '") AND (languageCode:' + language + ')';
  var search = new AjaxSolr.Search().filterSearch(query);
}


function cbChangegroup(obj, group) {
    var cbs = $('#' + group);
    var chkbs = cbs.find("li :input")
    //var chkbs = cbs.getElementsByTagName("input");
    for (var i = 0; i < chkbs.length; i++) {
        chkbs[i].checked = obj.checked;
    }
}

function cbcheckParent(parent) {
    var cbs = document.getElementById(parent);
    var atleastonechecked = false;

    var allInputs = document.getElementsByTagName("input");
    for (var i = 0, max = allInputs.length; i < max; i++){
        if (allInputs[i].type === 'checkbox' && allInputs[i].name.substring(0,2) === 'cb') {
            if (allInputs[i].name.substring(0,5) == parent+('-') && cbs.id != allInputs[i].id) {
                if (allInputs[i].checked) atleastonechecked = true;
            }
        }
    }
    cbs.checked = atleastonechecked;
}

function buildquery() {
    var query='';
    var langquery = '';
    var finalquery = '';
    var allselected = true;
    var allInputs = document.getElementsByTagName("input");
    for (var i = 0, max = allInputs.length; i < max; i++){
        if (allInputs[i].type === 'checkbox' && allInputs[i].name.substring(0,2) === 'cb') {
            if (allInputs[i].checked) {
                if (query != '') query += ' OR ';
                query += 'symbol:' + allInputs[i].name.substring(5,allInputs[i].name.length) + '*';
            }
        }
        //Languages Facet
        if (allInputs[i].type === 'checkbox' && allInputs[i].name.substring(0,2) === 'ch') {
            if (allInputs[i].checked) {
                allselected = true;
                if (langquery != '') langquery += ' OR ';
                langquery += 'languageCode:' + allInputs[i].name.substring(5,allInputs[i].name.length);
            }else{
                allselected = false;
            }
        }
    }
    if (query)
        finalquery = '(' + query + ')';
    if (langquery && !allselected)
        finalquery = ( (query !== '' ? query + ' AND (' + langquery + ')': '(' + langquery + ')'));

    //check if Advanced Search is selected and Add the ASQuery
    var isDisabled = $("#query").is(':disabled');
    if(isDisabled)
    {
        finalquery+= buildASquery();
    }

    return finalquery;
}

function buildASquery() {
    var ASquery = '';
    var allwords = (($("#ASwords").val()) ? '(' + $("#ASwords").val() + ');' : '');
    var exactphrase = (($("#ASexact").val()) ? '("' + $("#ASexact").val() + '");' : '');
    var atleastone = (($("#ASatleast").val()) ? '(' + $("#ASatleast").val().split(" ").join(" OR ") + ');' : '');
    var without = (($("#ASwithout").val()) ? '-(' + $("#ASwithout").val() + ');' : '');
    var language = (($("#language").val() !== '*') ? '(languageCode:' + $("#language").val() + ');' : '');
    var term_occurs = (($("#term_occurs").val() !== '*') ? $("#term_occurs").val() : '');

    var symbol = (($("#symbol").val()) ? 'symbol:(' + $("#symbol").val() + ');' : '');

    var pdateall = '';
    if (($("#pdatef").val()) || ($("#pdatet").val())) {
      var pdatef = (($("#pdatef").val()) ? new Date($("#pdatef").val()).toISOString() : '*');
      var pdatet = (($("#pdatet").val()) ? new Date($("#pdatet").val()).toISOString() : '*');  
      pdateall = 'publicationDate:[' + pdatef + ' TO ' + pdatet + '];';  
    }

    ASquery = (allwords + exactphrase + atleastone + without + symbol + pdateall ).split(";").join(" AND ");
    ASquery = ASquery.substring(0, ASquery.length - 5); //take out the last " AND "

    var tmp_term_occurs = '';
    switch (term_occurs) {
        case "title":
            tmp_term_occurs = 'title_en:' + ASquery + ' OR title_es:' + ASquery + ' OR title_fr:' + ASquery + ' OR title_ru:' + ASquery + ' OR title_ar:' + ASquery + ' OR title_zh-cn:' + ASquery;
            break;
        case "text":
            tmp_term_occurs = 'body_en:' + ASquery + ' OR body_es:' + ASquery + ' OR body_fr:' + ASquery + ' OR body_ru:' + ASquery + ' OR body_ar:' + ASquery + ' OR body_zh-cn:' + ASquery;
            break;
        case "url":
            tmp_term_occurs = 'url:(*//' + ASquery + '/*)';
            break;
    }


    //Get the values from the Subject dropdown
    var tmpSubjects= "";
    $('#subject option:selected').each(function () {
        tmpSubjects = tmpSubjects + "subjects:*" +$(this).text()+ "* OR " ;
    });
    tmpSubjects = tmpSubjects.substring(0,tmpSubjects.length -4);//take out the last " OR "

    //Get the values from the Sessions dropdown
    var tmpSessions= "";
    $('#session option:selected').each(function () {
        tmpSessions = tmpSessions + "session1:" +$(this).text()+ " OR " + "session2:" +$(this).text()+ " OR " + "session3:" +$(this).text()+ " OR " ;
    });
    tmpSessions = tmpSessions.substring(0,tmpSessions.length -4);//take out the last " OR "

    //Get the values from the Agenda dropdown
    var tmpAgenda= "";
    $('#agenda option:selected').each(function () {
        tmpAgenda = tmpAgenda + "agenda1:" +$(this).text()+ " OR " + "agenda2:" +$(this).text()+ " OR " + "agenda3:" +$(this).text()+ " OR " ;
    });
    tmpAgenda = tmpAgenda.substring(0,tmpAgenda.length -4);//take out the last " OR "

    //THIS WILL ONLY WORK FOR ODS COLLECTION
    var doctype = (($("#doctype").val() !== '*') ? 'pdfContentType:' + $("#doctype").val() + ';' : '');
    var pageupdates = (($("#lastupdate").val() !== '*') ? 'publicationDate:[NOW-' + $("#lastupdate").val() + 'DAYS TO NOW];' : '');


    if (doctype || pageupdates || doctype) {
      ASquery = (doctype + pageupdates + doctype ).split(";").join(" AND ");
      ASquery = tmp_term_occurs + ' AND ' + ASquery.substring(0, ASquery.length - 5); //take out the last " AND "
    }
    else if (tmp_term_occurs) {
        ASquery = tmp_term_occurs;
    }
    if (tmpSubjects){
        ASquery = (ASquery? ASquery + " AND " :"") + "("+ tmpSubjects+ ")";
    }
    if (tmpSessions){
        ASquery = (ASquery? ASquery + " AND " :"") + "("+ tmpSessions+ ")";
    }
    if (tmpAgenda){
        ASquery = (ASquery? ASquery + " AND " :"") + "("+ tmpAgenda+ ")";
    }

    return ASquery;
}


function getConnectionQuery(q) {

    $.ajax({
        type: "GET",
        url: 'X/results?query="' + q + '"',
        async: true,
        dataType: "jsonp",
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Access-Control-Allow-Credentials", "true");
            xhr.setRequestHeader("Access-Control-Allow-Methods", "GET");
            xhr.setRequestHeader("Access-Control-Allow-Headers", "AUTHORIZATION, X-CLIENT-ID, X-CLIENT_SECRET");
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'AUTHORIZATION, X-CLIENT-ID, X-CLIENT_SECRET"'
        },
        success: function (data, textStatus, jqXHR) {
            alert('success');
        },
        error: function (errorMessage) {
            alert('fail' + errorMessage);
        }
    });
}


