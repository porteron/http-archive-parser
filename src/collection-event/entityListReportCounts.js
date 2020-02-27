const _ = require('lodash');
 
let defaultTask = []

/**
 * THIS IS JUST A TEMPORARY UTIL FILE TO PRINT STATS
 */
console.log("Default Site Total Matches: ", defaultTask.length);
 
console.log("Same Site Total Matches: ", sameSite.length);

//581
console.log("Default Unique CheckSum: ", _.uniqBy(defaultTask, 'checkSum').length);
//478
console.log("Same Site Unique Checksum: ", _.uniqBy(sameSite, 'checkSum').length);

let o = {}

let addRoot = (e) => e.map((entity)=> {entity.root = `${entity.host.split('.')[entity.host.split('.').length-2]}.${entity.host.split('.')[entity.host.split('.').length-1]}`; return entity})

// console.log("Roots Default: ", _.uniqBy(roots(_.uniqBy(defaultTask, 'checkSum')), 'host'));
let ss = _.uniqBy(addRoot(_.uniqBy(sameSite, 'checkSum')), 'root');

let df  =_.uniqBy(addRoot(_.uniqBy(defaultTask, 'checkSum')), 'root');

console.log("Default Unique Roots: ", df.length);

console.log("Same Site Unique Roots: ", ss.length);

console.log("Difference By: ", _.differenceBy(df, ss, 'checkSum' ).length)

console.log("Data: ", _.differenceBy(df, ss, 'checkSum' ).map(({ checkSum })=>checkSum))


// Shared Strings - Same Site Report

// Default Site Total Matches:  31339
// Same Site Total Matches:  38179
// Default Unique CheckSum:  719
// Same Site Unique Checksum:  607
// Default Unique Roots:  90
// Same Site Unique Roots:  91
// Difference By:  11
