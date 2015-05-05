(function ($) {

AjaxSolr.UNBodyWidget = AjaxSolr.AbstractWidget.extend({
  
  init: function () {
    var widgetHTML = "<h4>UN Body</h4>";
      widgetHTML +=  "<hr>";
       widgetHTML += "<ul style=\"list-style-type: none;\">";
        widgetHTML += "<li><input type=\"checkbox\" id=\"cbGA\" name=\"cgGA-A\" onclick=\"return addRemoveFilter(this, 'committees','')\">";
        widgetHTML += "<label for=\"cbGA\" >General Assembly</label> <a class=\"icon fa-chevron-right\" onclick=\"return expandUnorderdList(this, 'ul');\"></a>";
          widgetHTML += "<ul id=\"committees\" style=\"list-style: none; display: none; margin: 0 0 0 0;\">";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('General_Assembly_First_Committee');\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbGAFirst\" name=\"cbGA-A/C.1\" onclick=\"return addRemoveFilter(this,'','cbGA')\">";
              widgetHTML += "<label for=\"cbGAFirst\">First Committee</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbGASecond\" name=\"cbGA-A/C.2\" onclick=\"return addRemoveFilter(this,'','cbGA')\">";
              widgetHTML += "<label for=\"cbGASecond\">Second Committee</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbGAThird\" name=\"cbGA-A/C.3\" onclick=\"return addRemoveFilter(this,'','cbGA')\">";
              widgetHTML += "<label for=\"cbGAThird\">Third Committee</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbGAFourth\" name=\"cbGA-A/C.4\" onclick=\"return addRemoveFilter(this,'','cbGA')\">";
              widgetHTML += "<label for=\"cbGAFourth\">Fourth Committee</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbGAFifth\" name=\"cbGA-A/C.5\" onclick=\"return addRemoveFilter(this,'','cbGA')\">";
              widgetHTML += "<label for=\"cbGAFifth\">Fifth Committee</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbGASix\" name=\"cbGA-A/C.6\" onclick=\"return addRemoveFilter(this,'','cbGA')\">";
              widgetHTML += "<label for=\"cbGASix\">Sixth Committee</label>";
            widgetHTML += "</li>";
          widgetHTML += "</ul>";
        widgetHTML += "</li>";
        widgetHTML += "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Security_Council');\"></a>&nbsp;&nbsp;";
          widgetHTML += "<input type=\"checkbox\" id=\"copy2\" name=\"cbSC-S\"  onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML += "<label for=\"copy2\">Security Council</label>";
        widgetHTML += "</li>";
        widgetHTML += "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Economic_and_Social_Council');\"></a>&nbsp;&nbsp;";
          widgetHTML += "<input type=\"checkbox\" id=\"copy3\" name=\"cbES-E\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML += "<label for=\"copy3\">Economic & Social Council</label>";
        widgetHTML += "</li>";
        widgetHTML += "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Human_Rights_Council');\"></a>&nbsp;&nbsp;";
          widgetHTML += "<input type=\"checkbox\" id=\"copy4\" name=\"cbHR-A/HRC\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML += "<label for=\"copy4\">Human Rights Council</label>";
        widgetHTML += "</li>";
        widgetHTML += "<li>"; //"a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Secretariat');\"></a>&nbsp;&nbsp;";
          widgetHTML += "<input type=\"checkbox\" id=\"cbSC\" name=\"cbSC-ST/SG\" onclick=\"return addRemoveFilter(this, 'secretariat','')\">";
          widgetHTML += "<label for=\"cbSC\">Secretariat</label><a class=\"icon fa-chevron-right\" onclick=\"return expandUnorderdList(this, 'ul');\"></a>";
          widgetHTML += "<ul id=\"secretariat\" style=\"list-style: none; display: none; margin: 0 0 0 0;\">";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbSCstic\" name=\"cbSC-ST/IC\" onclick=\"return addRemoveFilter(this,'','cbSC')\">";
              widgetHTML += "<label for=\"cbSCstic\">Information Circulars (ST/IC)</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbSCstai\" name=\"cbSC-ST/AI\" onclick=\"return addRemoveFilter(this,'','cbSC')\">";
              widgetHTML += "<label for=\"cbSCstai\">Admin. Instructions (ST/AI)</label>";
            widgetHTML += "</li>";
            widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
              widgetHTML += "<input type=\"checkbox\" id=\"cbSCbulletins\" name=\"cbSC-ST/SGB\" onclick=\"return addRemoveFilter(this,'','cbSC')\">";
              widgetHTML += "<label for=\"cbSCbulletins\">SG's Bulletins</label>";
            widgetHTML += "</li>";
          widgetHTML += "</ul>";
        widgetHTML += "</li>";
        widgetHTML += "<li>"; //"<a class=\"icon fa-info\" onclick=\"return getWiki('United_Nations_Administrative_Tribunal');\"></a>&nbsp;&nbsp;";
          widgetHTML += "<input type=\"checkbox\" id=\"copy6\" name=\"cbSC-AT\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML += "<label for=\"copy6\">Administrative Tribunal</label>";
        widgetHTML += "</li>";
        widgetHTML += "<li>"; //"<a class=\"icon fa-info\" style=\"color: rgba(205, 215, 230, 0.2)\"></a>&nbsp;&nbsp;";
          widgetHTML += "<input type=\"checkbox\" id=\"copy7\" name=\"cbAP-APLC\" onclick=\"return addRemoveFilter(this,'','')\">";
          widgetHTML += "<label for=\"copy7\">APL Convention</label>";
        widgetHTML += "</li>";
      widgetHTML += "</ul>";

      $('#customWidgets').append(widgetHTML);
  }
});

})(jQuery);
