"use strict";

//the domain used
const c_domain = "searchhipaa.cloud.coveo.com";
//the page to get the access token for
const c_page = "/pages/coveononproductionmux3a10i";
//url pointing to the full search page, so that authentication is triggered
const c_url =
  "https://searchhipaa.cloud.coveo.com/pages/coveononproductionmux3a10i/Coveo";

var g_window;
var g_token;
var g_changed;
var g_first;
var g_count = 0;
var g_check;
var g_afterauth;

function getToken(token, value) {
  try {
    let jwt = token;
    jwt = jwt.split(".")[1];
    jwt = jwt.replace(/-/g, "+").replace(/_/g, "/");
    jwt = JSON.parse(window.atob(jwt));
    return jwt[value];
  } catch (e) {
    return "";
  }
}

function getCookies(domain, name, path, callback) {
  chrome.cookies.getAll({}, function (cookies) {
    var a = "";
    //console.log("@getCookies. Cookies found " +  cookies.length);
    cookies.forEach(function (cookie) {
      //console.log("[COOKIE] => " + JSON.stringify(cookie));
      if (
        cookie.domain == domain &&
        cookie.name == name &&
        cookie.path == path
      ) {
        //console.log("[COOKIE] => " + JSON.stringify(cookie));
        //Check expiration date
        var exp = getToken(cookie.value, "exp");
        var d = new Date(0);
        var dn = new Date(0);
        var curd = new Date();
        d.setUTCSeconds(exp);
        //console.log("[EXP DATE] => "+d);
        d = d.setHours(d.getHours() - 20);
        dn = new Date(d);
        //console.log("[EXP DATE - 20 Hours ] => "+dn);
        if (dn > curd) {
          //console.log("[EXP DATE > Current ] => VALID TOKEN");
          a = cookie.value;
        } else {
        }
      }
    });
    callback(a);
  });
}

function debugAll() {
  chrome.cookies.getAll({}, function (cookies) {
    var a = [];
    console.log("@getCookies. Cookies found " + cookies.length);
    cookies.forEach(function (cookie) {
      console.log("[COOKIE] => " + JSON.stringify(cookie));
    });
    //results[tabId].cookies = a;
  });
}

function showNotification() {
  // Now create the notification
  chrome.notifications.create(
    "reminder",
    {
      type: "basic",
      iconUrl: "images/128.png",
      title: "Don't forget!",
      message: "In order to search, you need to authenticate first!",
    },
    function (notificationId) {}
  );
}

chrome.notifications.onClicked.addListener(function () {
  g_window = undefined;
  checkTokenCookie(true, true, null);
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === "Authenticate") {
    checkTokenCookie(true, true, null);
    return true;
  }
  if (msg.type === "GetToken") {
    checkTokenCookie(true, true, null);
    return true;
  }
});

function checkTokenCookie(openwindow, singletab, callback) {
  //Check cookie for proper access token
  getCookies(c_domain, "access_token", c_page, function (token) {
    if (token == "") {
      //Current token is empty, so we need to check if we need to authenticate
      g_token = undefined;

      //If Authentication window is closed or not defined
      if (g_window == undefined || g_window == null || g_window.closed) {
        g_first = undefined;
      }
      if (g_first == undefined && openwindow) {
        g_count = 0;
        console.log("COVEO IPX: First check for access token...");
        var showAlert = localStorage.getItem("coveo-ShowAlert");

        if (showAlert == null) {
          localStorage.setItem("coveo-ShowAlert", false);
          alert(
            "We do not have a valid token, you will be redirected to Coveo @ Coveo."
          );
        }

        console.log("COVEO IPX: Authentication openend...");
        g_afterauth = true;
        g_window = window.open(c_url, "CoveoIPXAuthentication");
        g_first = false;
        if (singletab) {
          //If waiting for the token we still need to sent an undefined token
          sentTokenToContent();
        }
      } else {
        console.log("COVEO IPX: Still no valid access token..." + g_count);
        if (singletab) {
          //If waiting for the token we still need to sent an undefined token
          sentTokenToContent();
        }

        g_count = g_count + 1;
        //After 50 attempts launch a notification window
        if (g_count > 50) {
          g_first = undefined;
          showNotification();
        }
      }
    } else {
      if (g_window != undefined) g_window.close();
      console.log("COVEO IPX: Token is => " + token);

      if (g_token != token) {
        if (g_token == undefined) {
          g_token = token;
          console.log("COVEO IPX: Brand new token, first phase");
          if (singletab) {
            sentTokenToContent();
          }
        } else {
          //Token is changed we need to reload
          g_token = token;
          console.log("COVEO IPX: changed token, we need to reload");
          if (singletab) {
            sentTokenToContent();
          }
        }
      } else {
        //Check if already inserted in page
        console.log("COVEO IPX: SentCheckTokenToContent");
        if (singletab) {
          sentTokenToContent();
        }
      }
    }
    if (callback != null) callback();
  });
}

function sentTokenToContent() {
  //Sending the initial token after page load in content.js to content.js
  getTabId_Then(function (g_tab) {
    if (g_tab != undefined) {
      let reload = false;
      if (g_afterauth != undefined) reload = true;
      chrome.tabs.sendMessage(
        g_tab,
        { action: "Token", token: g_token, reload: reload },
        function (response) {
          g_afterauth = undefined;
          //console.log(response);
        }
      );
    }
  });
}


function sentUpdateToContent() {
  //Sending the initial token after page load in content.js to content.js
  getTabId_Then(function (g_tab) {
    if (g_tab != undefined) {
      let reload = false;
      if (g_afterauth != undefined) reload = true;
      chrome.tabs.sendMessage(
        g_tab,
        { action: "CheckTokenAndUpdateContext", token: g_token, reload: reload },
        function (response) {
          g_afterauth = undefined;
          //console.log(response);
        }
      );
    }
  });
}

let getTabId_Then = (callback) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      if (tabs[0].url.includes("http:") || tabs[0].url.includes("https:")) {
        console.log("COVEO IPX: Tab id => " + tabs[0].id);
        callback(tabs[0].id);
      } else {
        console.log("COVEO IPX: Tab id => EMPTY");
        callback();
      }
    } else {
      console.log("COVEO IPX: Tab id => EMPTY");
      callback();
    }
  });
};

function sentToAllTabs(action) {
  checkTokenCookie(true, false, function () {
    chrome.tabs.query({}, (tabs) => {
      if (tabs.length > 0) {
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].url.includes("http:") || tabs[i].url.includes("https:")) {
            chrome.tabs.sendMessage(
              tabs[i].id,
              { action: action, token: g_token },
              function (response) {
                g_afterauth = undefined;
                //console.log(response);
              }
            );
          }
        }
      }
    });
  });
}

//When tab is being activated again, sent an update check to all open tabs
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log("COVEO IPX: Page activated, sending token check to all tabs...");
  sentToAllTabs("CheckTokenUpdate");
});

//When tab is updated, sent an update check to all open tabs
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  console.log("COVEO IPX: Url/page updated, sending token/context check for current tab only...");
  //sentToAllTabs("CheckTokenAndUpdateContext");
  sentUpdateToContent();
});

chrome.browserAction.onClicked.addListener(function (tab) {});
