const fetch = require("node-fetch");
const moment = require("moment");
require('dotenv').config();

var admin = require("firebase-admin");

var serviceAccount = require("./accountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

db.settings({ timestampsInSnapshots: true });

const body = state =>
  JSON.stringify({
    query: `
        query {
            repository(owner: "Microsoft", name:"azuredatastudio") {
                issues(states:${state}) {
                  totalCount
                }
              }
        }`
  });

function getIssues(body) {
  const url = "https://api.github.com/graphql";
  const options = {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `${process.env.GITHUB_TOKEN}`
    }
  };
  
  return fetch(url, options)
    .then(resp => resp.json())
    .then(data => {
      return data.data.repository.issues.totalCount;
    });
}

function getOpenIssues() {
  return getIssues(body("OPEN"));
}

function getClosedIssues() {
  return getIssues(body("CLOSED"));
}

module.exports = async function (context, req) {
    // context.log('JavaScript HTTP trigger function processed a request.');

    // if (req.query.name || (req.body && req.body.name)) {
    //     context.res = {
    //         // status: 200, /* Defaults to 200 */
    //         body: "Hello " + (req.query.name || req.body.name)
    //     };
    // }
    // else {
    //     context.res = {
    //         status: 400,
    //         body: "Please pass a name on the query string or in the request body"
    //     };
    // }
    var openIssues = await getOpenIssues();
    var closedIssues = await getClosedIssues();
  
    let now = moment().unix();
  
    let docRef = db.collection("entries").doc(now.toString());
  
    await docRef.set({
      timestamp: now,
      openIssues: openIssues,
      closedIssues: closedIssues
    });
  
    return "DONE";
};