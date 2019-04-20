//this forces javascript to conform to some rules, like declaring variables with var
"use strict";
var activeFavs = [];
$(document).ready(function () {
  var visit = localStorage.getItem('lastVisit');
  console.log(`Showing last date visited ${visit}`);
  document.getElementById("lastVisit").innerHTML = visit;

  // Populate user sections with session info
  var user = localStorage.getItem('activeUser');
  if (user && user != '') {
    $("#loginButton").replaceWith(`<button type="button" id="logoutButton" class="btn btn-secondary" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>`);
    $("#welcome").text(`Welcome back ${name}, enjoy your sports news!`);
    getFavorites();
  }
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

// Called on page start and login to show user favorites
function getFavorites() {
  console.log('Getting favorites');
  var favorites = localStorage.getItem('activeFavorites');
  if (favorites && favorites != '[]') {
    var json = JSON.parse(favorites);
    for (var fav in json) {
      console.log(json[fav]);
      $("#favs").append(json[fav]);
    }
    activeFavs = json;
  } else { console.log('No pre-existing favorites to be shown') }
}

// TODO: Tie this selected news item to account storage
$(document).on('click', '.fa-star', function() {
  if (localStorage.getItem('activeUser') && localStorage.getItem('activeUser') != '') {
    var card = $(this).parents()[2];
    var parent = ($(card).parent());

    // Add favorite
    if ($(this).hasClass('far')) {
      $("#favs").append(card);
      $(this).removeClass('far').addClass('fas');
      activeFavs.unshift(`${$(card).prop('outerHTML')}`);
      console.log('Favorite added');
    }
    else { // Remove favorite
      // Remove item card from Favorites array
      var newArray = [];
      var newArray = activeFavs.filter(function(e) {
        return $(e).prop('outerHTML') != $(card).prop('outerHTML');
      });
      activeFavs = newArray.slice();
      console.log(activeFavs);
      $(this).removeClass('fas').addClass('far');
      var originalTab = card.classList[1];
      $(`#${originalTab}`).append(card);
      console.log('Favorite removed');
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
            var line = `<div class="card content${contentNum}"><div class="card-body">`;
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
  var user = JSON.parse(JSON.parse(localStorage.getItem(name)));
  console.log(user);
  if (user) {
    console.log(`User exists. Password ${user["password"]}, favorites ${user["favorites"]}`);
    if (password == user["password"]) {
      console.log('Correct password, access granted');
      localStorage.setItem('activeFavorites', JSON.stringify(user["favorites"]));
      getFavorites();
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
  $("#welcome").text(`Welcome back ${name}, enjoy your sports news!`);
  localStorage.setItem('activeUser', name);
  localStorage.setItem('activePassword', password);
  console.log('Login complete');
}

// Sign out of account, stop displaying info, and revert view
// TODO: convert activeFavorites to user's favorites on logout
function logout() {
  var userJson = `{"password":"${localStorage.getItem('activePassword')}", "favorites":${JSON.stringify(activeFavs)}}`;
  localStorage.setItem((localStorage.getItem('activeUser')), JSON.stringify(userJson));
  console.log('User info cached');

  localStorage.setItem('activeUser', '');
  localStorage.setItem('activePassword', '');
  localStorage.setItem('activeFavorites', '[]');
  $(".fa-star").each(function() { $(this).removeClass('fas').addClass('far') });
  $("#favs").empty();
  $("#logoutButton").replaceWith(`<button type="button" id="loginButton" class="btn btn-primary" data-toggle="modal" data-target="#loginForm"><i class="fas fa-sign-in-alt"></i> Login</button>`);
  $("#welcome").text("Make sure to create an account to make the best of this dashboard!");
  console.log('Session info reset. Welcome, Login, and Favorites sections reset');
  console.log('Logout complete');
}

// Cache last visit on departure
window.addEventListener('beforeunload', function(e) {
  var date = new Date();
  localStorage.setItem('lastVisit', `Last visited: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
});
