(function ($) {

AjaxSolr.ECWidget = AjaxSolr.AbstractWidget.extend({
  
  init: function () {
    
    var widgetHTML = "<h4>Economic Commissions</h4>";
        widgetHTML +=  "<hr>";
        widgetHTML +=  "<ul style=\"list-style-type: none;\">";
          widgetHTML +=  "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Economic_Commission_for_Africa');\"></a>&nbsp;&nbsp;";
            widgetHTML +=  "<input type=\"checkbox\" id=\"copy8\" name=\"cbEC-E/ECA\" onclick=\"return addRemoveFilter(this,'','')\">";
            widgetHTML +=  "<label for=\"copy8\">ECA</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Economic_Commission_for_Europe');\"></a>&nbsp;&nbsp;";
            widgetHTML +=  "<input type=\"checkbox\" id=\"copy9\" name=\"cbEC-ECE\" onclick=\"return addRemoveFilter(this,'','')\">";
            widgetHTML +=  "<label for=\"copy9\">ECE</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Economic_Commission_for_Latin_America_and_the_Caribbean');\"></a>&nbsp;&nbsp;";
            widgetHTML +=  "<input type=\"checkbox\" id=\"copy10\" name=\"cbEC-LC\" onclick=\"return addRemoveFilter(this,'','')\">";
            widgetHTML +=  "<label for=\"copy10\">ECLAC</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Economic_and_Social_Commission_for_Asia_and_the_Pacific');\"></a>&nbsp;&nbsp;";
            widgetHTML +=  "<input type=\"checkbox\" id=\"copy11\" name=\"cbEC-E/ESCAP\" onclick=\"return addRemoveFilter(this,'','')\">";
            widgetHTML +=  "<label for=\"copy11\">ESCAP</label>";
          widgetHTML +=  "</li>";
          widgetHTML +=  "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Economic_and_Social_Commission_for_Western_Asia');\"></a>&nbsp;&nbsp;";
            widgetHTML +=  "<input type=\"checkbox\" id=\"copy12\" name=\"cbEC-www.E/ESCWA\" onclick=\"return addRemoveFilter(this,'','')\">";
            widgetHTML +=  "<label for=\"copy12\">ESCWA</label>";
          widgetHTML +=  "</li>";
        widgetHTML +=  "</ul>";

      $('#customWidgets').append(widgetHTML);
  }
});

})(jQuery);
