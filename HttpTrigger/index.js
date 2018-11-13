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
      Authorization: `${process.env.AUTH_GITHUB_TOKEN}`
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

function triggerCommit() {
  const url = "https://api.netlify.com/build_hooks/5beb44603813f032ca05fcb6";
  const options = {
      method: POST,
      body: "{}"
  };
  return fetch(url, options).then(resp => resp.json());
}

module.exports = async function (context, myTimer) {
    triggerCommit();
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