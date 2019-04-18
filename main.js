//this forces javascript to conform to some rules, like declaring variables with var
"use strict";
$(document).ready(function () {
  var visit = localStorage.getItem('lastVisit');
  console.log(`Showing last date visited ${visit}`);
  document.getElementById("lastVisit").innerHTML = visit;
  var urls = ["http://www.espn.com/espn/rss/news",
              "http://www.espn.com/espn/rss/nfl/news",
              "http://www.espn.com/espn/rss/nba/news",
              "http://www.espn.com/espn/rss/mlb/news",
              "http://www.espn.com/espn/rss/nhl/news",
              "http://www.espn.com/espn/rss/golf/news",
              "http://www.espn.com/espn/rss/rpm/news"];
    for (var i = 0; i < urls.length; i++) {
        request(urls[i], i);
    }
});
function request(urlToRequest, contentNum) {
    $.ajax({
        url: urlToRequest,
        success: function (data) {
          var items = data.querySelectorAll("item");
          //parse the data
          var html = "";
          for (var i=0; i<items.length; i++) {
            //get the data out of the item
            var newsItem = items[i];
            var title = newsItem.querySelector("title").firstChild.nodeValue;
            var description = newsItem.querySelector("description").firstChild.nodeValue;
            var link = newsItem.querySelector("link").firstChild.nodeValue;
            var pubDate = newsItem.querySelector("pubDate").firstChild.nodeValue;

            //present the item as HTML
            var line = '<div class="card"><div class="card-body">';
            line += '<h5 class="card-title">'+title+"</h5>";
            line += '<p class="card-text"><i>'+pubDate+'</i> - <a href="'+link+'" target="_blank" class="btn btn-secondary">See original</a></p>';
            line += "</div></div>";
            html += line;
          }
          console.log(`Content from ${urlToRequest} loaded to tab ${contentNum}`);
          document.querySelector(`#content${contentNum}`).innerHTML = html;
        }
    });
}
window.addEventListener('beforeunload', function(e) {
  var date = new Date();
  localStorage.setItem('lastVisit', `Last visited: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
});
