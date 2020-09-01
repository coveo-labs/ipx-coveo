"use strict";


var g_window;
var g_notlogged = false;
var g_currentToken='';
var g_expire;
var g_token;
var g_changed;
var g_first;
var g_count = 0;
var g_check;
var g_afterauth;

/*
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
}*/
g_window=false;

function setCookie()
{
  g_currentToken = g_token;
  var dn = new Date();
  dn.setHours(dn.getHours()+8);
  g_expire = dn;
  
}
function getCookies(callback) {
  var dn = new Date();
  if (dn>g_expire) {
    g_currentToken = undefined;
    g_notlogged = false;
    callback("")
  } else {
    callback(g_currentToken);
  }
  
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

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === "Authenticate") {
    checkTokenCookie(true, true, null);
    return true;
  }
  if (msg.type === "GetToken") {
    console.log("COVEO IPX: Received GetToken");
    checkTokenCookie(true, true, null);
    return true;
  }
});


function checkTokenCookie(openwindow, singletab, callback) {
  //Check cookie for proper access token
  getCookies(function (token) {
    if (token == "") {
      //Current token is empty, so we need to check if we need to authenticate
      g_token = undefined;
      if (g_window==false){
        g_window = true;
        getAccessToken(function(){
          g_window=false;
          if (g_notlogged) {
            sentSignInToContent();
          } else {
            sentTokenToContent();
          }
        });
      }
      
    } else {
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
      console.log("Sending Token action");
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


function sentSignInToContent() {
  //Sending the initial token after page load in content.js to content.js
  getTabId_Then(function (g_tab) {
    if (g_tab != undefined) {
      let reload = false;
      if (g_afterauth != undefined) reload = true;
      chrome.tabs.sendMessage(
        g_tab,
        { action: "SignIn", token: g_token, reload: reload },
        function (response) {
          g_afterauth = undefined;
          //console.log(response);
        }
      );
    }
  });
}

/*
function sentToken() {
  //Sending the initial token after page load in content.js to content.js
  getTabId_Then(function (g_tab) {
    if (g_tab != undefined) {
      let reload = false;
      if (g_afterauth != undefined) reload = true;
      chrome.tabs.sendMessage(
        g_tab,
        { action: "GetToken", token: g_token, reload: reload },
        function (response) {
          g_afterauth = undefined;
          //console.log(response);
        }
      );
    }
  });
}*/


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




function xhrCheckToken(url, token, callback) {
  // Send the POST Request
  let xhttp = new XMLHttpRequest();
  xhttp.open('POST', url+token+"&platform="+c_platform+"&secret="+c_secret, true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
  //console.log(xhttp);
  xhttp.onload = function () {
    callback(xhttp.response);
  }
  xhttp.send();
  return xhttp;
}

function getAccessToken(callback){
  // Using chrome.identity
  var manifest = chrome.runtime.getManifest();
  /*chrome.identity.getAuthToken({interactive: true}, function(token) {
    console.log(token);
  });*/
  var clientId = encodeURIComponent(manifest.oauth2.client_id);
  var scopes = encodeURIComponent(manifest.oauth2.scopes.join(' '));
  //var redirectUri = encodeURIComponent('https://' + chrome.runtime.id + '.chromiumapp.org');
  //var redirectUri = encodeURIComponent('https://ipxcoveo.chromiumapp.org/');
  var redirectUri = chrome.identity.getRedirectURL("oauth2");
  var url = 'https://accounts.google.com/o/oauth2/auth' + 
            '?client_id=' + clientId + 
            '&response_type=id_token' +
            '&access_type=offline' + 
            '&redirect_uri=' + redirectUri + 
            '&nonce=ipxcoveo'+
            '&scope=' + scopes;

  var logged=false;
  chrome.identity.launchWebAuthFlow(
      {
          'url': url, 
          'interactive':false
      }, 
      function(redirectedTo) {
          if (chrome.runtime.lastError) {
              // Example: Authorization page could not be loaded.
              g_notlogged = true;
              console.log(chrome.runtime.lastError.message);
          }
          else {
              g_notlogged = false;
              logged=true;
              var response = redirectedTo.split('#', 2)[1];
              console.log(response);
              //Now connect to node application to get access_token
              var token=response.split('&')[0].split('=')[1];
              let responsexhr=xhrCheckToken(c_tokenserver, token, function(req){
                let jsonresp=JSON.parse(req);
                if (jsonresp['valid']==true){
                  g_token=jsonresp['access_token'];
                  setCookie();
                }
                else {
                  g_token = undefined;
                }
                callback();
  
              });
              
          }
      }
  );
  if (!logged){
   url = 'https://accounts.google.com/o/oauth2/auth' + 
    '?client_id=' + clientId + 
    '&response_type=id_token' +
    '&access_type=offline' + 
    '&prompt=select_account' +
    '&redirect_uri=' + redirectUri + 
    '&nonce=ipxcoveo'+
    '&scope=' + scopes;
  chrome.identity.launchWebAuthFlow(
      {
          'url': url, 
          'interactive':true
      }, 
      function(redirectedTo) {
          if (chrome.runtime.lastError) {
              // Example: Authorization page could not be loaded.
              g_notlogged = true;
              console.log(chrome.runtime.lastError.message);
          }
          else {
              g_notlogged = false;
              logged=true;
              var response = redirectedTo.split('#', 2)[1];
              console.log(response);
              //Now connect to node application to get access_token
              var token=response.split('&')[0].split('=')[1];
              let responsexhr=xhrCheckToken(c_tokenserver, token, function(req){
                let jsonresp=JSON.parse(req);
                if (jsonresp['valid']==true){
                  g_token=jsonresp['access_token'];
                  setCookie();
                }
                else {
                  g_token = undefined;
                }
                callback();
  
              });
              
          }
      }
  );
  }
}

chrome.browserAction.onClicked.addListener(function (tab) {
  //checkTokenw();
  //sentToken();
  //g_notlogged=true;
  //getAccessToken();
  //sentSignInToContent();
  //checkTokenCookie(true, true, null);
  //getAccessToken(function(){console.log(g_token)});
  /*chrome.identity.getProfileUserInfo(function(userinfo){
    console.log("userinfo",userinfo);
    try {
    email=userinfo.email;
    checkUser();
    console.log("email",email);
    } catch(e){
      console.log("email not found, first login to google!");
    }
  });*/
});
