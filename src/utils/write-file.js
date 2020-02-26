const fs = require('fs');

// Write file to file system
const writeFile = (name, data) => {
    fs.writeFile(name, data, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("\n---- JSON file has been saved ----\n");
    });
}

module.exports = writeFile;
