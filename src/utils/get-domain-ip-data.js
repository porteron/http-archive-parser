const fetch = require('node-fetch');

async function getDomainIpData(domain) {
    let res = await (await fetch(`http://api.ipapi.com/${domain}?access_key=2f7ccd33e73e003765b365f7f020000a&format=1`)).json()
    return res;
}

export default getDomainIpData;
