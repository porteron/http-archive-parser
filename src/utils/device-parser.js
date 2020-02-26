const parser = require('ua-parser-js');
const flattenjson = require('./flattenjson');

/*

SCHEMA

    {
        ua: "",
        browser: {
            name: "",
            version: ""
        },
        engine: {
            name: "",
            version: ""
        },
        os: {
            name: "",
            version: ""
        },
        device: {
            model: "",
            type: "",
            vendor: ""
        },
        cpu: {
            architecture: ""
        }
    }
*/

const deviceParser = ua => {
    let deviceData = flattenjson(parser(ua)) 
    console.log("---- Device data: ", deviceData)
    return deviceData
}

module.exports = deviceParser;
