
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
const c_IPXurl =
  "https://platform.cloud.coveo.com/rest/organizations/workplacedemoqjjnc2v7/pages/e236a5d5-d8c2-452c-9cfc-da9f15730c72/inappwidget/loader";
const c_IPXurl2 = 
"https://platformhipaa.cloud.coveo.com/rest/organizations/coveononproductionmux3a10i/pages/a0591a31-a247-4d93-8def-c0219b87c620/inappwidget/loader";

//the lambda function to call, which will create a access_token
const c_tokenserver="https://hc1twffj7g.execute-api.us-east-1.amazonaws.com/prod?key=123412341234alkdjsflkjasdfopiuq23l4k4j51234l1234&token="

//const platform to use to retrieve the search token
const c_platform = 'platform';//'platformhipaa';
//const secret to retrieve
const c_secret = 'IPX';