const fetch = require("node-fetch");

function triggerCommit() {
    const url = "https://api.netlify.com/build_hooks/5beb44603813f032ca05fcb6";
    const options = {
        method: "POST",
        body: "{}"
    };
    return fetch(url, options).then(resp => resp.json());
}


module.exports = async function (context, myTimer) {
    triggerCommit();
};