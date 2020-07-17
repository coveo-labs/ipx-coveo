
//*************************************************************************************** */
//REPLACE WITH YOUR OWN
//*************************************************************************************** */


//the domain used
const c_domain = "searchhipaa.cloud.coveo.com";
//the page to get the access token for
const c_page = "/pages/coveononproductionmux3a10i";
//url pointing to the full search page, so that authentication is triggered
const c_url =
  "https://searchhipaa.cloud.coveo.com/pages/coveononproductionmux3a10i/Coveo";
//url pointing to the hub page
const c_url_hub =
  "https://searchhipaa.cloud.coveo.com/pages/coveononproductionmux3a10i/hub";

//those pages which have a conflict, it looks fine, but clicking on the button causes a CORS eror
//on those pages we simply will navigate to the hub
const c_buttononly=['https://connect.coveo.com/'];

//the url from the IPX
const c_IPXurl =
  "https://platformhipaa.cloud.coveo.com/rest/organizations/coveononproductionmux3a10i/pages/a0591a31-a247-4d93-8def-c0219b87c620/inappwidget/loader";