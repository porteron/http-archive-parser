// Checks to see if a domain is a subdomain, based on how many periods it has
const isSubdomain = (url) => {
    try {
        let splitDomain = url.replace("www.", "");
        splitDomain = splitDomain.split(".");

        if (splitDomain.length > 2) {
            return 1;
        }
        return 0;
    } catch (error) {
        console.log("Subdomain Check Error: ", error)
    }
}

module.exports = isSubdomain;