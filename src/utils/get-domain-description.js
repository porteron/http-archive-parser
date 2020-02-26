const scrape = require('html-metadata');

async function getDomainDescription(url) {
    let metadata = await scrape(`http://${url}`);
    return metadata
}

export default getDomainDescription;
