'use strict';
// jshint -W003
/*global chrome*/
var added;
var error;
var previous;
console.log('COVEO IPX: Adding IPX code CONTENT.JS');

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action=='Check') {
    console.log('COVEO IPX: Checking IPX code');
    if (error==true){
      console.log('COVEO IPX: Bad page, cannot insert');
      sendResponse({});
      return;
    }
    let ipx = document.getElementById('CoveoIPXScript');
    if (ipx!=null) {
      console.log('COVEO IPX: IPX is there, do nothing.');
    } else {
    added=true;
    removeIPX();
    addIPX(request.token);
    setContext();
    }
  } else
  if (request.action=='UpdateContext') {
    console.log('COVEO IPX: Update Context only');
    let ipx = document.getElementById('CoveoIPXScript');
    if (ipx!=null) {
      setContext();
    }
  } else
  if (request.action=='Update') {
    console.log('COVEO IPX: Adding IPX NEW code');
    added=true;
    removeIPX();
    addIPX(request.token);
    setContext();
  } else {
  if (added==undefined){
    console.log('COVEO IPX: Adding IPX code');
    added=true;
    removeIPX();
    addIPX(request.token);
    setContext();    
  }
}


  sendResponse({});
});


function removeButton()
{
  try {
    let v=document.getElementsByTagName('coveo-in-app-widget-loader')[0];
    v.remove();
  } catch(e)
  {

  }
}

function removeIPX()
{
  let ipx = document.getElementById('CoveoIPXScript');
  if (ipx!=null) ipx.remove();
}

function addIPX(token)
{

  //*************************************
  //Load the IPX code
  //*************************************
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.id="CoveoIPXScript";
  script.src = "https://platformhipaa.cloud.coveo.com/rest/organizations/coveononproductionmux3a10i/pages/a0591a31-a247-4d93-8def-c0219b87c620/inappwidget/loader?search_token="+token;
  document.getElementsByTagName('head')[0].appendChild(script);
  setTimeout(function() { fixButton(); },500);
}

function fixButton() {
  let v=document.getElementsByTagName('coveo-in-app-widget-loader')[0];
  let button = v.shadowRoot.querySelector("button");
  button.style = 'bottom: 50px !important;';
}

function setInProd(script) {
  var ret = {};

  var scriptContent = script;
  
  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(script);

  document.getElementById('tmpScript').remove();
}

function checkIPX() {

  var scriptContent = "var checkCoveoUA=typeof coveoua;document.body.setAttribute('mycoveoipxtest',checkCoveoUA)";
  
  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(script);
  let uavalue = document.body.attributes['mycoveoipxtest'].value;
  document.getElementById('tmpScript').remove();
  let valid=true;
  //Check if script is properly activated. If not remove the integration
  if (uavalue=="undefined"){
    valid=false;
    error = true;
    removeButton();
    removeIPX();
  }
  return valid;
}

function setContext(){
  setTimeout(function() {
    
    if (checkIPX()==false) return;
    console.log('COVEO IPX: Setting context');
      const url = String(window.location);
      var disable=false;
      var title='';
      var gotitle='';
      var contexttouse='';
      var contextkey='';
      var contents='';
      try {
          title = document.title;
          contexttouse=''+title+'';
          contextkey='title';
      }
      catch(e)
      {
      }
      //Better (for confluence and jira)
      try {
          title = document.querySelector('meta[name="ajs-page-title"]').content;
          contexttouse=''+title+'';
          contextkey='title';
      }
      catch(e)
      {
      }
      try {
        title = document.querySelector('h1').innerText;
        contexttouse=''+title+'';
        contextkey='title';
    }
    catch(e)
    {
    }
    
      //Better (for Bolstra)
      try {
          title = document.querySelector('avatar[class="account-avatar ng-isolate-scope"]').avatar-name;
          contexttouse=''+title+'';
          contextkey='title';
      }
      catch(e)
      {
      }
      //Google sets a better og:title, so use that
      try {
          gotitle = document.querySelector('meta[property="og:title"]').content;
          contexttouse=''+gotitle+'';
          contextkey='title';
      }
      catch(e)
      {
      }
      //Specific ones
      //*********************
      //Google Drive
      //*********************
      if (url.indexOf('https://drive.google.com')>-1) {
          contexttouse='"'+url+'"';
          contextkey='url';
      }
      //*********************
      //One Drive personal
      //*********************
      if (url.indexOf('my.sharepoint.com/personal')>-1 && url.indexOf('listurl=')==-1) {
          const regex = /personal\/(.*)\/_lay/gm;
          contents = decodeURIComponent(regex.exec(url)[1]);
          console.log('COVEO IPX, setting one drive personal [DIR]');
          console.log(contents);
          contexttouse='"'+contents+'"';
          contextkey='url';
      }
      //*********************
      //One Drive site
      //*********************
      if (url.indexOf('my.sharepoint.com/personal')>-1 && url.indexOf('listurl=')>-1) {
          const regex = /listurl=(.*)$/gm;
          contents = decodeURIComponent(regex.exec(url)[1]);
          console.log('COVEO IPX, setting one drive site [LIST]');
          console.log(contents);
          contexttouse='"'+contents+'"';
          contextkey='url';
      }
      //*********************
      //Sharepoint
      //*********************
      if (url.indexOf('sharepoint.com')>-1 && url.indexOf('my.sharepoint.com')==-1) {
          const regex = /\.sharepoint\.com\/(.*)\/.*\.aspx/gm;
          contents = decodeURIComponent(regex.exec(url)[1]).replace('/Forms','');
          console.log('COVEO IPX, setting sharepoint [LIST]');
          console.log(contents);
          contexttouse='"'+contents+'"';
          contextkey='url';
      }
      //*********************
      //Teams
      //*********************
      if (url.indexOf('teams.microsoft.com')>-1) {
          const regex = /(.* \(.*\)) |/gm;
          contents = decodeURIComponent(regex.exec(title)[1]);
          console.log(contents);
          contexttouse='"'+url+'"';
          contextkey='team';
          //Team integration does not work, so remove the control
          //disable=true;
      }
      //*********************
      //Office Documents
      //*********************
      if (url.indexOf('15/Doc.aspx')>-1) {
          const regex = /file=(.*?)&action/gm;
          contents = decodeURIComponent(regex.exec(url)[1]);
          console.log(contents);
          contexttouse=''+contents+'';
          contextkey='title';
      }
      //Remove dots
      if (disable){
        removeButton();
      } else 
      {
        contexttouse = contexttouse.replace(/\./g,' ');
        let go=false;
        if (previous==undefined) { go = true;}
        else {
          if (previous!=contexttouse) { go=true;}
        }
        if (go){
          previous = contexttouse;
          if (contextkey=='title'){
            setInProd("CoveoInProduct.setContextValue('"+contextkey+"','"+contexttouse+"');");
            setInProd("CoveoInProduct.setContextValue('"+contextkey+"Str','"+'"'+contexttouse+'"'+"');");
          } else {
            setInProd("CoveoInProduct.setContextValue('"+contextkey+"','"+contexttouse+"');");
          }
        }
      }
      
      //coveoinprod.setContextValue(contextkey,contexttouse);
  }, 1500);
}
