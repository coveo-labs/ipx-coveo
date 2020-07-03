'use strict';
// jshint -W003
/*global chrome*/

console.log('Pagescript added');
window.addEventListener('GET_COVEO', function getCoveoInPage(event) {
  //You can also use dispatchEvent
  console.log('Sending CoveoInProduct');
  window.postMessage({action: 'GOT_COVEO', coveoref: CoveoInProduct}, '*');
}, false);
/*
console.log('IPX page load');
  setTimeout(function() {
      const url = String(window.location);
      var title='';
      var gotitle='';
      var contexttouse='';
      var contextkey='';
      var contents='';
      try {
          title = document.title;
          contexttouse='"'+title+'"';
          contextkey='title';
      }
      catch(e)
      {
      }
      //Better (for confluence and jira)
      try {
          title = document.querySelector('meta[name="ajs-page-title"]').content;
          contexttouse='"'+title+'"';
          contextkey='title';
      }
      catch(e)
      {
      }
      //Better (for Bolstra)
      try {
          title = document.querySelector('avatar[class="account-avatar ng-isolate-scope"]').avatar-name;
          contexttouse='"'+title+'"';
          contextkey='account';
      }
      catch(e)
      {
      }
      //Google sets a better og:title, so use that
      try {
          gotitle = document.querySelector('meta[property="og:title"]').content;
          contexttouse='"'+gotitle+'"';
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
          //console.log(contents);
          contexttouse='"'+url+'"';
          contextkey='dir';
      }
      //*********************
      //One Drive site
      //*********************
      if (url.indexOf('my.sharepoint.com/personal')>-1 && url.indexOf('listurl=')>-1) {
          const regex = /listurl=(.*)$/gm;
          contents = decodeURIComponent(regex.exec(url)[1]);
          console.log(contents);
          contexttouse='"'+url+'"';
          contextkey='list';
      }
      //*********************
      //Sharepoint
      //*********************
      if (url.indexOf('sharepoint.com')>-1 && url.indexOf('my.sharepoint.com')==-1) {
          const regex = /\.sharepoint\.com\/(.*)\/.*\.aspx/gm;
          contents = decodeURIComponent(regex.exec(url)[1]).replace('/Forms','');
          console.log(contents);
          contexttouse='"'+url+'"';
          contextkey='list';
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
      }
      //*********************
      //Office Documents
      //*********************
      if (url.indexOf('15/Doc.aspx')>-1) {
          const regex = /file=(.*?)&action/gm;
          contents = decodeURIComponent(regex.exec(url)[1]);
          console.log(contents);
          contexttouse='"'+url+'"';
          contextkey='title';
      }

      console.log('Setting Context...');
      window.CoveoInProduct.setContextValue(contextkey,contexttouse);
  }, 2500);
*/