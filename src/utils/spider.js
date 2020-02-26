const Spider = require('node-spider');
const writeFile = require('../utils/write-file');

const DOMAIN = "http://onpar.blogs.nytimes.com"

let urls = {};
let count = 0;

const spider = new Spider({
    // How many requests can be run in parallel
    concurrent: 5,
    // How long to wait after each request
    delay: .2,
    // A stream to where internal logs are sent, optional
    logs: process.stderr,
    // Re-visit visited URLs, false by default
    allowDuplicates: false,
    // If `true` all queued handlers will be try-catch'd, errors go to `error` callback
    catchErrors: true,
    // If `true` the spider will set the Referer header automatically on subsequent requests
    addReferrer: false,
    // If `true` adds the X-Requested-With:XMLHttpRequest header
    xhr: false,
    // If `true` adds the Connection:keep-alive header and forever option on request module
    keepAlive: false,
    // Called when there's an error, throw will be used if none is provided
    error: function (error, url) {
        urls[url] = 0;
        console.log("\nFETCH ERROR: ", error)
    },
    // Called when there are no more requests
    done: function () {
        writeFile('src/utils/spider.json', JSON.stringify(Object.keys(urls)))
    },

    //- All options are passed to `request` module, for example:
    headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36' },
    encoding: 'utf8'
});

const handleRequest = function (doc) {
    // new page crawled
    // console.log(doc.res); // response object
    console.log(doc.url); // page url
    let href;
    let url;
    count++
    // uses cheerio, check its docs for more info
    doc.$('a').each(function (i, elem) {
        href = doc.$(elem).attr('href').split('#')[0];
        url = doc.resolve(href);
        urls[url] = 0;
    });
    // urls.map((url)=>{

    // })
    // if (url.match("nytimes")) {
    //     spider.queue(url, handleRequest);
    // }
};

// start crawling
spider.queue(DOMAIN, handleRequest);



