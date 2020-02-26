const fs = require('fs')
const _ = require('lodash');
const parseUrl = require('url');
const { sharedStrings } = require('./shared-strings.parser');

async function entityList(_har) {
    let har = await _har;
    try {
        return Object.keys(har).reduce((output, string) => {
            Object.keys(har[string].urls).map(pages => {
                Object.keys(har[string].urls[pages]).map(page => {
                    har[string].urls[pages][page].matches.map(({ name, type }) => {
                        output.push({ name, type, host: parseUrl.parse(page).hostname, checkSum: `${name}-${parseUrl.parse(page).hostname}-${type}` })
                    })
                })
            })
            return output;
        }, []);
    } catch (error) {
        console.log("Entity List Error: ", error)
    }
}

const compareOutputs = async (output1, output2) => {
    console.log("Compare Outputs 1 - 2: ", output1.length, output2.length)
    return _.differenceBy(_.uniqBy(output1, 'checkSum'), _.uniqBy(output2, 'checkSum'), 'checkSum')
}

const createReport = (diff) => {
    console.log(`\n--- Creating Report - ${diff.length} --- \n`)
    fs.writeFile(`src/parser/outputs/output-diff-${diff.length}.json`, JSON.stringify(diff), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("\n---- JSON file has been saved ----\n");
    });
}

const valueDiff = (har1, har2) => {
    return Object.keys(har2).reduce((output, string) => {
        if (!har1[string]) {
            output.push(string.value)
        }
        return output
    }, [])
}


const differential = async (har1, har2) => {
    try {
        console.log("\n--- Differential ---")

        return (
            await compareOutputs(
                await entityList(sharedStrings(har1)),
                await entityList(sharedStrings(har2))
            )
        )
    } catch (error) {
        console.log("Differential Error: ", error)
        throw new Error("Differential Parse Error")
    }
};


module.exports = { entityList, differential };
