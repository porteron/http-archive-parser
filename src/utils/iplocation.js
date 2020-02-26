const fetch = require("node-fetch")
/*

Location Schema
        {
            as: 'AS11286 KeyBank National Association',
            city: 'Cleveland',
            country: 'United States',
            countryCode: 'US',
            isp: 'KeyBank National Association',
            org: 'KeyBank National Association',
            region: 'OH',
            regionName: 'Ohio',
            timezone: 'America/New_York',
        }
 
 */


const getLocation = ip => new Promise(async (resolve, reject) => {
    let url = `http://ip-api.com/json/${ip}`;
    // let url = `http://ip-api.com/json/196.245.9.12`;

    let res = await (await fetch(url)).json();

    // console.log("IP RES: ", res)

    let data = {
        as: null,
        city: null,
        country: null,
        countryCode: null,
        isp: null,
        org: null,
        region: null,
        regionName: null,
        timezone: null,
    }

    // let data = {
    //     as: 'test',
    //     city: 'test',
    //     country: 'test',
    //     countryCode: 'test',
    //     isp: 'test',
    //     org: 'test',
    //     region: 'test',
    //     regionName: 'test',
    //     timezone: 'test',
    // }

    if (res) {
        data = {
            city: res.city,
            country: res.country,
            countryCode: res.countryCode,
            isp: res.isp,
            org: res.org,
            region: res.region,
            regionName: res.regionName,
            timezone: res.timezone
        }
        console.log("region: ", data)
        resolve(data)
    }
});

module.exports = getLocation;
