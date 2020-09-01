"use strict";
// jshint -W003
/*global chrome*/

var added;
var error;
var previous;
var g_token;
var g_empty;
var g_message;
var g_prevcontext;
var g_loadattempts;

console.log("COVEO IPX: Adding IPX extenstion code to CONTENT.JS");

//Add the IPX to the page
//Before we do that, get the token from the background
g_loadattempts = 0;
let SendMessage = (parameters) => {
  setTimeout(() => {
    try {
      chrome.runtime.sendMessage(parameters);
    } catch (e) {
      console.log(e);
    }
  }, 100);
};

added = false;
//SendMessage to background to get the current token from the cookies
SendMessage({
  type: "GetToken",
});

//For now we have 3 stages:
// 1 response.token is undefined --> we need to do nothing, just activate the ipx
// 2 response.token is new --> we need to reload the current page
// 3 response.token is current --> we need to do nothing



chrome.extension.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  console.log("COVEO IPX: Action = " + request.action);
  console.log("COVEO IPX: Token = "+request.token);
  console.log("COVEO IPX: Current Token = "+g_token);
  if (request.action == "SignIn") {
    changeButtonToReload();
  }
  else if (request.action == "CheckTokenUpdate") {
    console.log("COVEO IPX: Check if current token is still the same, added="+added);
    if (!added) {
      console.log("COVEO IPX: Sending back GetToken, attempt="+g_loadattempts);
      g_loadattempts = g_loadattempts + 1;
      if (g_loadattempts > 3) {
        //addIPX(request.token);
        //setTimeout( function() {changeButtonToReload();}, 500);
        g_loadattempts = 0;
        SendMessage({
          type: "GetToken",
        });
      }
    }
    if (added) {
      if (!error) {
        if (g_token != request.token || request.token == undefined) {
          //changeButtonToReload();
          renewToken();
        } else {
          setContext();
        }
      }
    }
  } else if (request.action == "CheckTokenAndUpdateContext") {
    console.log(
      "COVEO IPX: Check if current token is still the same, if so set Context"
    );
    if (!added) {
      g_loadattempts = g_loadattempts + 1;
      if (g_loadattempts > 3) {
        //addIPX(request.token);
        //setTimeout( function() {changeButtonToReload();}, 500);
        g_loadattempts = 0;
        SendMessage({
          type: "GetToken",
        });
      }
    }
    if (added) {
      if (!error) {
        if (g_token != request.token || request.token == undefined) {
          //changeButtonToReload();
          renewToken();
        }
        //Proceed to update the context
        setContext();
      }
    }
  } else if (request.action == "Token") {
    console.log(
      "COVEO IPX: Received Token, after page load. Happens only once."
    );
    //Simply add the IPX with the token requested, will also fix the button and will check if IPX is properly loaded
    if (added) {
      if (!error) {
        if (g_token != request.token || request.token == undefined) {
          //changeButtonToReload();
          renewToken();
        }
        //Proceed to update the context
        setContext();
      }
    } else {
      g_token = request.token;
      addIPX(request.token);
    }
    
    
  }

  sendResponse({});
});



function removeButton() {
  try {
    let v = document.getElementsByTagName("coveo-in-app-widget-loader")[0];
    v.remove();
  } catch (e) {}
}

function removeIPX() {
  let ipx = document.getElementById("CoveoIPXScript");
  if (ipx != null) ipx.remove();
}

function IPXLoaded() {
  console.log("COVEO IPX: IPX is fully loaded, continue to fixButton");
  //IPX loaded, fix the button
  setTimeout(function () {
    fixButton();
  }, 500);
}

function addIPX(token) {
  //*************************************
  //Load the IPX code
  //*************************************
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.id = "CoveoIPXScript";
  script.src = c_IPXurl + "?access_token=" + token;
  //script.onreadystatechange = IPXLoaded();
  script.onload = IPXLoaded();

  document.getElementsByTagName("head")[0].appendChild(script);
}

function validToken() {
  return true;
  
}

function renewToken() {
  console.log("Renew Token");
  setInProd(
    "CoveoInProduct.setRenewAccessTokenFunction(function(){console.log('COVEO IPX: RenewIsCalled');Promise.resolve('"+g_token+"');});"
  );
}



function changeButtonToReload() {
  let v = document.getElementsByTagName("coveo-in-app-widget-loader")[0];
  if (v != undefined) {
    let button = v.shadowRoot.querySelector("button");
    removeAllClicks(button);
    button = v.shadowRoot.querySelector("button");
    button.innerText = "Sign In to Google";
    button.setAttribute("onclick", "javascript:document.location.reload(true);return false;");
  }
}

function onlyButton() {
  let button = false;
  let loc = String(window.location);
  c_buttononly.forEach(function (url) {
    if (loc.indexOf(url) >= 0) {
      button = true;
    }
  });
  return button;
}

function removeAllClicks(button){
  var old_element = button;
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
}

function fixButton() {
  //Fixes the button, will also check if that does not work
  //that is an indication that we could not load the IPX scripts
  let v = document.getElementsByTagName("coveo-in-app-widget-loader")[0];
  if (v == undefined) {
    console.log(
      "COVEO IPX: Loader is undefined at fixButton. waiting to fix button."
    );
    g_loadattempts = g_loadattempts + 1;
    if (g_loadattempts < 5) {
      setTimeout(function () {
        fixButton();
      }, 500);
      return;
    } else {
      added = true;
      error = true;
      console.log("COVEO IPX: FixButton to many times. Remove IPX.");
      removeButton();
      removeIPX();
      return;
    }
  }
  //renewToken();
  console.log("COVEO IPX: Fixing Button.");
  let button = v.shadowRoot.querySelector("button");
  button.style = "bottom: 50px !important;";
  if (onlyButton()) {
    removeAllClicks(button);
    button = v.shadowRoot.querySelector("button");
    button.setAttribute("onclick", "window.open('"+c_url_hub+"','_blank');return false;");
  } else {
    //Add onclick with our own
    g_message = true;
    button.addEventListener("click", function (e) {
      if (!validToken()) {
        e.preventDefault();
        let v = document.getElementsByTagName("coveo-page-modal")[0];
        if (v != null) v.remove();
        g_message = false;
        button.click();
        g_message = true;
        if (g_message) {
          console.log("COVEO IPX: No valid token yet, we need to authenticate");
          SendMessage({
            type: "Authenticate",
          });
        }
      }
    });
    //If all went well, checkIPX and setContext
    setTimeout(function () {
      checkIPX();
      setContext();
    }, 1000);
  }
}

function setInProd(script) {
  //Set the InProduct code, since the CoveoInProduct is in a different context we need to do it like this
  var ret = {};

  var scriptContent = script;

  var script = document.createElement("script");
  script.id = "tmpScript";
  script.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );

  document.getElementById("tmpScript").remove();
}

function checkIPX() {
  //Check if the IPX is properly loaded.
  //We check if the coveoua is available in the page, if so all good, else remove the IPX

  console.log("COVEO IPX: checkIPX, is properly loaded?");
  let v = document.getElementsByTagName("coveo-in-app-widget-loader")[0];
  var scriptContent =
    "var checkCoveoUA=typeof coveoua;document.body.setAttribute('mycoveoipxtest',checkCoveoUA)";

  var script = document.createElement("script");
  script.id = "tmpScript";
  script.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
  let uavalue = document.body.attributes["mycoveoipxtest"].value;
  document.getElementById("tmpScript").remove();

  let valid = true;
  //Check if script is properly activated. If not remove the integration
  if (uavalue == "undefined") {
    console.log("COVEO IPX: UA not defined remove IPX.");
    valid = false;
    added = true;

    error = true;
    removeButton();
    removeIPX();
  } else {
    added = true;

    console.log("COVEO IPX: UA is defined DO NOT REMOVE IPX.");
  }
  return valid;
}

function setContext() {
  //Set The context. Will check if url is the same to avoid resetting the context which will result in a new search.
  setTimeout(function () {
    //if (checkIPX()==false) return;
    if (error) return;
    console.log("COVEO IPX: Setting context");
    const url = String(window.location);
    //if g_prevcontext == url, then already parsed and set
    var go = true;
    if (g_prevcontext == undefined) {
      go = true;
    } else {
      if (g_prevcontext == url) {
        go = false;
      }
    }
    if (!go) {
      console.log("COVEO IPX: SKIPPING Setting context in component");
    }
    if (go) {
      console.log("COVEO IPX: Setting context in component");
      g_prevcontext = url;
      var disable = false;
      var title = "";
      var gotitle = "";
      var contexttouse = "";
      var contextkey = "";
      var contents = "";
      try {
        title = document.title;
        contexttouse = "" + title + "";
        contextkey = "title";
      } catch (e) {}
      //Better (for confluence and jira)
      try {
        title = document.querySelector('meta[name="ajs-page-title"]').content;
        contexttouse = "" + title + "";
        contextkey = "title";
      } catch (e) {}
      try {
        title = document.querySelector("h1").innerText;
        contexttouse = "" + title + "";
        contextkey = "title";
      } catch (e) {}

      //Better (for Bolstra)
      try {
        title =
          document.querySelector(
            'avatar[class="account-avatar ng-isolate-scope"]'
          ).avatar - name;
        contexttouse = "" + title + "";
        contextkey = "title";
      } catch (e) {}
      //Google sets a better og:title, so use that
      try {
        gotitle = document.querySelector('meta[property="og:title"]').content;
        contexttouse = "" + gotitle + "";
        contextkey = "title";
      } catch (e) {}
      //Specific ones
      //*********************
      //Google Drive
      //*********************
      if (url.indexOf("https://drive.google.com") > -1) {
        contexttouse = '"' + url + '"';
        contextkey = "url";
      }
      //*********************
      //One Drive personal
      //*********************
      if (
        url.indexOf("my.sharepoint.com/personal") > -1 &&
        url.indexOf("listurl=") == -1
      ) {
        const regex = /personal\/(.*)\/_lay/gm;
        contents = decodeURIComponent(regex.exec(url)[1]);
        console.log("COVEO IPX, setting one drive personal [DIR]");
        console.log(contents);
        contexttouse = '"' + contents + '"';
        contextkey = "url";
      }
      //*********************
      //One Drive site
      //*********************
      if (
        url.indexOf("my.sharepoint.com/personal") > -1 &&
        url.indexOf("listurl=") > -1
      ) {
        const regex = /listurl=(.*)$/gm;
        contents = decodeURIComponent(regex.exec(url)[1]);
        console.log("COVEO IPX, setting one drive site [LIST]");
        console.log(contents);
        contexttouse = '"' + contents + '"';
        contextkey = "url";
      }
      //*********************
      //Sharepoint
      //*********************
      if (
        url.indexOf("sharepoint.com") > -1 &&
        url.indexOf("my.sharepoint.com") == -1
      ) {
        const regex = /\.sharepoint\.com\/(.*)\/.*\.aspx/gm;
        contents = decodeURIComponent(regex.exec(url)[1]).replace("/Forms", "");
        console.log("COVEO IPX, setting sharepoint [LIST]");
        console.log(contents);
        contexttouse = '"' + contents + '"';
        contextkey = "url";
      }
      //*********************
      //Teams
      //*********************
      if (url.indexOf("teams.microsoft.com") > -1) {
        const regex = /(.* \(.*\)) |/gm;
        contents = decodeURIComponent(regex.exec(title)[1]);
        console.log(contents);
        contexttouse = '"' + url + '"';
        contextkey = "team";
        //Team integration does not work, so remove the control
        //disable=true;
      }
      //*********************
      //Office Documents
      //*********************
      if (url.indexOf("15/Doc.aspx") > -1) {
        const regex = /file=(.*?)&action/gm;
        contents = decodeURIComponent(regex.exec(url)[1]);
        console.log(contents);
        contexttouse = "" + contents + "";
        contextkey = "title";
      }
      //Remove dots
      if (disable) {
        removeButton();
      } else {
        contexttouse = contexttouse.replace(/\./g, " ");
        let go = false;
        if (previous == undefined) {
          go = true;
        } else {
          if (previous != contexttouse) {
            go = true;
          }
        }
        if (go) {
          previous = contexttouse;
          if (contextkey == "title") {
            setInProd(
              "CoveoInProduct.setContextValue('" +
                contextkey +
                "','" +
                contexttouse +
                "');"
            );
            setInProd(
              "CoveoInProduct.setContextValue('" +
                contextkey +
                "Str','" +
                '"' +
                contexttouse +
                '"' +
                "');"
            );
          } else {
            setInProd(
              "CoveoInProduct.setContextValue('" +
                contextkey +
                "','" +
                contexttouse +
                "');"
            );
          }
        }
      }
    }

    //coveoinprod.setContextValue(contextkey,contexttouse);
  }, 1500);
}
