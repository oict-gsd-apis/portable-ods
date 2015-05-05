/*
* Author: Kevin Thomas Bradley
* Date: 12-Jan-2015
* Description: Statistics for the Enterprise Search using Google Analytics API
* Notes: Application setup in Developers Console to accept connections from devserver.local.com
*/
// Setup initial GA function
(function(w,d,s,g,js,fjs){
  g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(cb){this.q.push(cb)}};
  js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
  js.src='https://apis.google.com/js/platform.js';
  fjs.parentNode.insertBefore(js,fjs);js.onload=function(){g.load('analytics')};
}(window,document,'script'));

// Entry point
gapi.analytics.ready(function() {
  // Client ID for the application - available in Developers Console
  var CID = 'XXX';

  // Setup the auth button for initial Login
  /*gapi.analytics.auth.authorize({
    container: 'auth-button',
    clientid: CID,
  });*/

  var clientId = 'XXX';
  var apiKey = 'XXX';
  var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

  gapi.client.setApiKey(apiKey);

  gapi.auth.authorize({
    client_id: clientId, 
    scope: scopes, 
    immediate: true
  }, function(authResult) {
    if (authResult) {
      alert('good');
    } else {
      alert('bad');
    }
  });

  // Setup the view selector - TODO: Default this to ODS and hide
  var viewSelector = new gapi.analytics.ViewSelector({
    container: 'view-selector'
  });
  // Setup Session Chart
  var sessions = new gapi.analytics.googleCharts.DataChart({
    reportType: 'ga',
    query: {
      'dimensions': 'ga:date',
      'metrics': 'ga:sessions',
      'start-date': '30daysAgo',
      'end-date': 'yesterday',
    },
    chart: {
      type: 'LINE',
      container: 'sessions',
      options: {
        width: '100%'
      }
    }
  });
  // Setup list of browsers - this is hidden by default in UI
  var listOfBrowsers = new gapi.analytics.googleCharts.DataChart({
    reportType: 'ga',
    query: {
      'dimensions': 'ga:browser',
      'metrics': 'ga:sessions',
      'sort': '-ga:sessions',
      'max-results': '7',
    },
    chart: {
      type: 'TABLE',
      container: 'browsers'
    }
  });
  // Setup event handler for on success for further processing
  // Used to setup Top Browsers custom Chart
  listOfBrowsers.on('success', function(response) {
    var data = [];
    var colors = ['#F79321', '#f5bc7a','#f5ca98','#f5daba','#f5daba'];

    var out = "";
    var count = response.dataTable.getNumberOfRows();
    for (i = 0; i < count; i++) { 
      data.push({
        label: response.dataTable.getValue(i, 0),
        value: response.dataTable.getValue(i, 1),
        color: colors[i]
      });
    }

    // Setup Donut from Chart.js
    $('#donutBrowsers').replaceWith('<canvas id="donutBrowsers" width="300" height="300"></canvas>');
    var ctx = document.getElementById("donutBrowsers").getContext("2d");;
    var myNewChart = new Chart(ctx).Doughnut(data);
  });

  // Setup Country User map
  var mapCountryUsers = new gapi.analytics.googleCharts.DataChart({
    query: {
      'dimensions': 'ga:country',
      'metrics': 'ga:users'
    },
    chart: {
      type: 'GEO',
      container: 'countryUsers',
      options: {
        width: '100%'
      }
    }
  });

  // Setup pie chart of users - this is not displayed by default
  var pieUsers = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:sessions',
      dimensions: 'ga:country',
      'start-date': '30daysAgo',
      'end-date': 'yesterday',
      'max-results': 6,
      sort: '-ga:sessions'
    },
    chart: {
      type: 'PIE',
      container: 'pieOfUsers'
    }
  });

  // Event handler for pieUsers - used for Donut User construction
  pieUsers.on('success', function(response) {
    
    var data = [];
    var colors = ['#344A5A', '#526c80','#1B75BB','#5090CD','#E6E9F2'];

    var out = "";
    var count = response.dataTable.getNumberOfRows();
    for (i = 0; i < count; i++) { 
      data.push({
        label: response.dataTable.getValue(i, 0),
        value: response.dataTable.getValue(i, 1),
        color: colors[i]
      });
    }
    // Setup Donut user chart from Chart.js
    $('#donutUsers').replaceWith('<canvas id="donutUsers" width="300" height="300"></canvas>');
    var ctx = document.getElementById("donutUsers").getContext("2d");;
    var myNewChart = new Chart(ctx).Doughnut(data);
    $("#donutUsers").append(myNewChart.generateLegend());
  });

  // List of keywords - not displayed by default
  var listOfKeywords = new gapi.analytics.googleCharts.DataChart({
    reportType: 'ga',
    query: {
      'dimensions': 'ga:keyword',
      'metrics': 'ga:sessions',
      'max-results': '20'
    },
    chart: {
      type: 'TABLE',
      container: 'keywords'
    }
  });

  // Setup page load times bar chart
  var pageTimeLoads = new gapi.analytics.googleCharts.DataChart({
    reportType: 'ga',
    query: {
      'dimensions': 'ga:date',
      'metrics': 'ga:avgPageLoadTime'
    },
    chart: {
      type: 'COLUMN',
      container: 'pageLoads',
      options: {
        width: '100%'
      }
    }
  });

  // Event handler - On successful authentication
  gapi.analytics.auth.on('success', function(response) {
    // Hide the authorisation button as we are already logged in
    $('#auth-button').hide();
    viewSelector.execute();
  });

  // Event handler for change of view selector
  viewSelector.on('change', function(ids) {
    var newIds = {
      query: {
        ids: ids
      }
    }

    // Update the following components
    sessions.set(newIds).execute();
    listOfBrowsers.set(newIds).execute();
    mapCountryUsers.set(newIds).execute();
    listOfKeywords.set(newIds).execute();
    pageTimeLoads.set(newIds).execute();
    pieUsers.set(newIds).execute();
    populateWords();
  });
});

// Static list of search terms used in Word Cloud
var frequency_list = "coi united nations committee on information committee library dag hammershold article 2 of universal declaration general assembly 69 session programme"
var frequency_list = frequency_list.split(" ");
var color = d3.scale.category20();

// Entry point function for use with Word Cloud - called from viewSelector event handler
function populateWords(allWords) {
  d3.layout.cloud().size([500, 250])
    .words(frequency_list.map(function(d) {
      return {text: d, size: 10 + Math.random() * 30};
    }))
    .rotate(0)
    .padding(5)
    .fontSize(function(d) { return d.size; })
    .on("end", draw)
    .start();
}

// Draw function used to contruct the actual SVG for the word cloud
function draw(words) {
    d3.select("#wordSVG").remove();
    d3.select("#wordc").append("svg")
            .attr("id","wordSVG")
            .attr("width", 550)
            .attr("height", 300)
            .attr("x", 0)
            .append("svg:g")
            // without the transform, words words would get cutoff to the left and top, they would
            // appear outside of the SVG area
            .attr("transform", "translate(320,200)")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("fill", function(d, i) { return color(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x-90, d.y-90] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
}