'use strict';

const c_domain='searchhipaa.cloud.coveo.com';
//const c_page='/pages/coveo';
//const c_url='https://searchhipaa.cloud.coveo.com/pages/coveo/Coveo';
const c_page='/pages/coveononproductionmux3a10i';
const c_url='https://searchhipaa.cloud.coveo.com/pages/coveononproductionmux3a10i/Coveo';
/*
const c_whitelist=['https://drive.google.com/',
                    'https://docs.google.com/',
                    'https://coveord.atlassian.net/',
                    '.sharepoint.com']
const c_blacklist=['https://www.google.com/',
                    'teams.microsoft.com'
                    ]
*/
var g_window;
var g_token;
var g_first;
var g_check;

function getToken(token,value) {
  try {
  let jwt = token;
      jwt = jwt.split('.')[1];
      jwt = jwt.replace(/-/g, '+').replace(/_/g, '/');
      jwt = JSON.parse(window.atob(jwt));
      return jwt[value];
  }catch(e)
  {
    return "";
  }

}


function getCookies(domain,  name,path, callback) {
  chrome.cookies.getAll({}, function (cookies) {
    var a = "";
    //console.log("@getCookies. Cookies found " +  cookies.length);
    cookies.forEach(function(cookie) {
      //console.log("[COOKIE] => " + JSON.stringify(cookie));
        if (cookie.domain==domain && cookie.name==name && cookie.path==path){
          //console.log("[COOKIE] => " + JSON.stringify(cookie));
          //Check expiration date
          var exp=getToken(cookie.value,'exp');
          var d = new Date(0);
          var dn = new Date(0);
          var curd = new Date();
          d.setUTCSeconds(exp);
          //console.log("[EXP DATE] => "+d);
          d= d.setHours(d.getHours()-20);
          dn = new Date(d);
          //console.log("[EXP DATE - 20 Hours ] => "+dn);
          if (dn>curd) {
            //console.log("[EXP DATE > Current ] => VALID TOKEN");
            a=cookie.value;
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
    console.log("@getCookies. Cookies found " +  cookies.length);
    cookies.forEach(function(cookie) {
        console.log("[COOKIE] => " + JSON.stringify(cookie));
        
    });
    //results[tabId].cookies = a;
  });
}

function checkToken() {
  //Check cookie for proper access token
  getCookies(c_domain, "access_token",c_page, function(token) {
    if (token==""){
      
      if (g_first==undefined){
        console.log('COVEO IPX: First check for access token...');
        var showAlert=localStorage.getItem('coveo-ShowAlert');

        if (showAlert==null) {
               localStorage.setItem('coveo-ShowAlert',false);
               alert('We do not have a valid token, you will be redirected to Coveo @ Coveo.');
        }
        g_window=window.open(c_url, '_blank');
        g_first=false;
        activateWaitForToken();
      } else {
        console.log('COVEO IPX: Still no valid access token...');
        activateWaitForToken();
      }
    }
    else {
      if (g_window!=undefined) g_window.close();
      console.log('COVEO IPX: Token is => '+token);
      
      if (g_token!=token) {
        if (g_token==undefined) {
          g_token = token;
          console.log('COVEO IPX: SentTokenToContent');
          sentTokenToContent();
          activateCheckForToken();
        } else 
        {
          g_token = token;
          console.log('COVEO IPX: SentUpdateTokenToContent');
          sentUpdateTokenToContent();
          activateCheckForToken();
        }
      } else {
        //Check if already inserted in page
        console.log('COVEO IPX: SentCheckTokenToContent');
        sentCheckTokenToContent();
        activateCheckForToken();
        /*if (g_insertedin[g_tab]==false){
          g_insertedin[g_tab]=true;
          sentTokenToContent();
        }*/
      }
    }
  });
}

function activateWaitForToken(){
  if (g_check) {
    clearInterval(g_check);
  }
  g_check = setInterval(function(){ checkToken()},15000);
}

function activateWaitForTokenNow(){
  if (g_check) {
    clearInterval(g_check);
  }
  g_check = setInterval(function(){ checkToken()},2000);
}

function activateCheckForToken(){
  if (g_check) {
    clearInterval(g_check);
  }
  g_check = setInterval(function(){ checkToken()},1000000);
}


function sentTokenToContent(){
  //console.log('sending token to content'+g_tab);
  getTabId_Then(function(g_tab) 
  {
    if (g_tab!=undefined){
      chrome.tabs.sendMessage(g_tab, {action:'New', token: g_token}, function (response) {
      //console.log(response);
      });
    }
  });

}


function sentUpdateContextToContent(){
  //console.log('sending token to content'+g_tab);
  getTabId_Then(function(g_tab) 
  {
    if (g_tab!=undefined){
      chrome.tabs.sendMessage(g_tab, {action:'UpdateContext', token: g_token}, function (response) {
      //console.log(response);
      });
    }
  });

}


function sentCheckTokenToContent(){
  //console.log('sending token to content'+g_tab);
  getTabId_Then(function(g_tab) 
  {
    if (g_tab!=undefined){
        chrome.tabs.sendMessage(g_tab, {action:'Check', token: g_token}, function (response) {
      //console.log(response);
      });
    }
  });

}


function sentUpdateTokenToContent(){
  //console.log('sending update token to content'+g_tab);
  getTabId_Then(function(g_tab) {
    if (g_tab!=undefined){
      chrome.tabs.sendMessage(g_tab, {action:'Update',token: g_token}, function (response) {
    //console.log(response);
    });
  }
});

}

let getTabId_Then = (callback) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true}, (tabs) => {
    if (tabs.length>0){
      if (tabs[0].url.includes('http:') || tabs[0].url.includes('https:') ) {
        console.log('COVEO IPX: Tab id => '+tabs[0].id);
        callback(tabs[0].id);
      }
      else {
        console.log('COVEO IPX: Tab id => EMPTY');
        callback();

      }
    } else
    {
      console.log('COVEO IPX: Tab id => EMPTY');
      callback();
    }
  });
};

//When tab is being activated again
chrome.tabs.onActivated.addListener(function (activeInfo){
  console.log('COVEO IPX: Page activated, waiting for token...');
  activateWaitForTokenNow();

});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  console.log('COVEO IPX: URL CHANGED...');
  sentUpdateContextToContent();
  if (tab.url !== undefined && info.status == "complete") {

    chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, function (tabs) {
      //g_tab = tabs[0].id;
      //g_insertedin[g_tab]=false;
      console.log('COVEO IPX: Page loaded, waiting for token...');
      activateWaitForTokenNow();
      //activateCheckForToken();
    });
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
   
});
