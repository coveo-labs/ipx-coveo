
//*************************************************************************************** */
//REPLACE WITH YOUR OWN
//*************************************************************************************** */

//url pointing to the hub page
const c_url_hub =
  "https://searchhipaa.cloud.coveo.com/pages/ORG_ID/PAGE_ID";

//those pages which have a conflict, it looks fine, but clicking on the button causes a CORS eror
//on those pages we simply will navigate to the hub
const c_buttononly=['https://connect.coveo.com/','https://docs.coveo.com/'];

//the url for the IPX
const c_IPXurl = 
"https://platformhipaa.cloud.coveo.com/rest/organizations/ORG_ID/pages/PAGE_ID/inappwidget/loader";


//the redirect to use when oauth to the platform
const c_redirect="chrome-extension://jhkpgelecpiobemfpapbnkhcpdhdjeae/html/o2c.html"
const c_redirect2="chrome-extension://gkphanphbahkcfchihfidhlpdbdchgem/html/o2c.html"

//org id
const c_org = 'coveo';
//the oauth url
const c_oauth = `https://platformhipaa.cloud.coveo.com/oauth/authorize?client_id=CoveoIPX&response_type=token&redirect_uri=${c_redirect}&scope=full&organizationId=${c_org}&skipLoginPage`;

//const platform to use to retrieve the search token
const c_platform = 'platformhipaa.cloud.coveo.com';//'platformhipaa';
//const secret to retrieve
const c_secret = 'IPX';