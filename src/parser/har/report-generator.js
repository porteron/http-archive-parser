require('dotenv').config();
const { parse } = require('json2csv');
const { getS3Object, uploadS3Object } = require('../../utils/s3');
const { sharedStrings } = require('./shared-strings.parser')
const { entityList, differential } = require('./diff.parser');


const reportGenerator = async (body) => {
    let { report_type, files = [], format, raw = [], save = true, update = false } = body;
    console.log("--- Report Generator ---");

    // Report Functions
    const reports = {
        sharedStrings,
        entityList: async (har) => await entityList(sharedStrings(har)),
        differential: async (har1, har2) => {
            if (format === 'csv') {
                const fields = { fields: ['name', 'type', 'host', 'checkSum'] };
                return parse(await differential(har1, har2), fields)
            } else {
                return differential(har1, har2)
            }
        }
    }

    try {
        let report = null;

        // Check to see if report already exists
        if (!update && files[0]) {
            let objectKey = null;
            if (files.length === 2) {
                objectKey = `${files[0]}+${files[1]}-${report_type}`;
            }
            if (files.length === 1) {
                objectKey = `${files[0]}-${report_type}`;
            }
            try {
                report = await getS3Object('mx-parser-reports', objectKey);
                console.log("--- Report Exists ---")
                return report;
            } catch (error) {
                console.log("File does not exists yet - Continue:  ", error)
            }
        }

        let har1 = raw[0] ? raw[0] : await getS3Object(process.env.AWS_DATA_COLLECTION_BUCKET, files[0]);
        let har2 = raw[1] ? raw[1] : files[1] ? await getS3Object(process.env.AWS_DATA_COLLECTION_BUCKET, files[1]) : undefined;


        let harCount = 0;

        switch (report_type) {
            case 'sharedStrings':
                report = reports.sharedStrings(har1);
                harCount = 1;
                break;
            case 'entityList':
                report = reports.entityList(har1);
                harCount = 1;
                break;
            case 'differential':
                report = reports.differential(har1, har2);
                harCount = 2;
                break;
            default:
                report = 'Unknown Report Type'
        }

        // Save the report
        if (save && files[0] && harCount > 0) {
            let objectKey = null;
            if (harCount === 2) {
                objectKey = `${files[0]}+${files[1]}-${report_type}`;
            }
            if (harCount === 1) {
                objectKey = `${files[0]}-${report_type}`;
            }
            uploadS3Object(process.env.AWS_DATA_COLLECTION_BUCKET, objectKey, await report);
        }
        return report;

    } catch (error) {
        console.log("Report Generator: ", error)
        throw new Error("Report Generator Error")
    }
}

module.exports = { reportGenerator }
