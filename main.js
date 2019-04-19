//this forces javascript to conform to some rules, like declaring variables with var
"use strict";

$(document).ready(function () {
  var visit = localStorage.getItem('lastVisit');
  console.log(`Showing last date visited ${visit}`);
  document.getElementById("lastVisit").innerHTML = visit;
  localStorage.setItem('activeUser', '');

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

// TODO: Tie this selected news item to account storage
$(document).on('click', '.fa-star', function() {
  if (localStorage.getItem('activeUser') != '') {
    if ($(this).hasClass('far')){
      console.log('Favorite added');
      console.log($(this).parents()[2]);
      $(this).removeClass('far').addClass('fas');
    } else {
      console.log('Favorite removed');
      $(this).removeClass('fas').addClass('far');
    }
  } else { alert('Log in to favorite this item!') }
});

// Get RSS information and display it
function request(urlToRequest, contentNum) {
    $.ajax({
        url: urlToRequest,
        success: function (data) {
          var items = data.querySelectorAll("item");
          // Parse the RSS data
          var html = "";
          for (var i=0; i<items.length; i++) {
            // Get the data out of the item
            var newsItem = items[i];
            var title = newsItem.querySelector("title").firstChild.nodeValue;
            var description = newsItem.querySelector("description").firstChild.nodeValue;
            var link = newsItem.querySelector("link").firstChild.nodeValue;
            var pubDate = newsItem.querySelector("pubDate").firstChild.nodeValue;

            // Construct item as HTML
            var line = '<div class="card"><div class="card-body">';
            line += '<h5 class="card-title">'+title+"</h5>";
            line += '<p class="card-text" style="user-select:none"><i class="far fa-star"></i> <i>'+pubDate+'</i> - <a href="'+link+'" target="_blank" class="btn btn-secondary">See original</a></p>';
            line += "</div></div>";
            html += line;
          }
          console.log(`Content from ${urlToRequest} loaded to tab ${contentNum}`);
          document.querySelector(`#content${contentNum}`).innerHTML = html;
        }
    });
}

// Check if existing or create new account, then update displays
function login() {
  var name = $("#username").val();
  var password = $("#password").val();
  $("#password").val('');
  $("#password").removeClass('is-invalid');
  console.log(`Attempting login of username ${name} and password ${password}`);

  var user = JSON.parse(JSON.parse(localStorage.getItem(name)));
  if (user) {
    console.log(`User exists. Password ${user["password"]}, favorites ${user["favorites"]}`);
    if (password == user["password"]) {
      console.log('Correct password, access granted');
    }
    else {
      $("#password").addClass('is-invalid');
      console.log('Incorrect password, try again');
      return false;
    }
  } else {
    console.log("User doesn't exist, creating account");
    var accountInfo = `{"password": "${password}", "favorites": []}`;
    var stringInfo = JSON.stringify(accountInfo);
    localStorage.setItem(name, stringInfo);
  }

  $("#loginForm").modal('toggle');
  $("#loginButton").replaceWith(`<button type="button" id="logoutButton" class="btn btn-secondary" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>`);
  localStorage.setItem('activeUser', name);
  console.log('Login complete');
}

// Sign out of account, stop displaying info, and revert view
function logout() {
  localStorage.setItem('activeUser', '');
  $(".fa-star").each(function() {
    $(this).removeClass('fas').addClass('far');
  });
  $("#favs").empty();
  $("#logoutButton").replaceWith(`<button type="button" id="loginButton" class="btn btn-primary" data-toggle="modal" data-target="#loginForm"><i class="fas fa-sign-in-alt"></i> Login</button>`);
  console.log('Logout complete');
}

// Cache last visit on departure
window.addEventListener('beforeunload', function(e) {
  var date = new Date();
  localStorage.setItem('lastVisit', `Last visited: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
});
