
//*************************************************************************************** */
//REPLACE WITH YOUR OWN
//*************************************************************************************** */

//url pointing to the hub page
const c_url_hub =
  "https://searchhipaa.cloud.coveo.com/pages/coveo/Coveo";

//those pages which have a conflict, it looks fine, but clicking on the button causes a CORS eror
//on those pages we simply will navigate to the hub
const c_buttononly=['https://connect.coveo.com/','https://docs.coveo.com/'];

//the url for the IPX
const c_IPXurl2 =
  "https://platform.cloud.coveo.com/rest/organizations/workplacedemoqjjnc2v7/pages/e236a5d5-d8c2-452c-9cfc-da9f15730c72/inappwidget/loader";
const c_IPXurl = 
"https://platformhipaa.cloud.coveo.com/rest/organizations/coveo/pages/d98a09b8-d42d-43a1-bbd4-beeafa32777b/inappwidget/loader";


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