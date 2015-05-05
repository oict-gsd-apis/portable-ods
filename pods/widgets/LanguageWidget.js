(function ($) {

AjaxSolr.LanguageWidget = AjaxSolr.AbstractWidget.extend({
  
  init: function () {
    
    var widgetHTML = "<h4>Languages</h4>";
        widgetHTML +=  "<hr>";
        widgetHTML +=  "<ul style=\"list-style-type: none;\">";
          widgetHTML +=  "<li>&nbsp;&nbsp;<input type=\"checkbox\" checked=\"checked\" id=\"chlg-ar\" name=\"chlg-ar\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-ar\">عربي</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>&nbsp;&nbsp;";
          widgetHTML +=  "<input type=\"checkbox\" checked=\"checked\" id=\"chlg-zh-cn\" name=\"chlg-zh-cn\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-zh-cn\">中文</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>&nbsp;&nbsp;";
          widgetHTML +=  "<input type=\"checkbox\" checked=\"checked\" id=\"chlg-en\" name=\"chlg-en\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-en\">English</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>&nbsp;&nbsp;";
          widgetHTML +=  "<input type=\"checkbox\" checked=\"checked\" id=\"chlg-fr\" name=\"chlg-f\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-fr\">Français</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>&nbsp;&nbsp;";
          widgetHTML +=  "<input type=\"checkbox\" checked=\"checked\" id=\"chlg-ru\" name=\"chlg-ru\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-ru\">Русский</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>&nbsp;&nbsp;";
          widgetHTML +=  "<input type=\"checkbox\" checked=\"checked\" id=\"chlg-es\" name=\"chlg-es\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-es\">Español</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>&nbsp;&nbsp;";
          widgetHTML +=  "<input type=\"checkbox\" checked=\"checked\" id=\"chlg-other\" name=\"chlg-other\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML +=  "<label for=\"chlg-other\">Other</label>";
          widgetHTML +=  "</li>";
        widgetHTML +=  "</ul>";

      $('#customWidgets').append(widgetHTML);
  }
});

})(jQuery);
