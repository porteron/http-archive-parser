const writeFile = require('../../utils/write-file');
const parseUrl = require('url');
const { escapeRegExp } = require('../../utils/escape-regex');

const {
  FILE_LOCATION,
  LEVELS,
  ENTRY_TYPES,
  REPORT_KEY_NAME_MAX_LENGTH,
  REPORT_URL_MAX_LENGTH,
  IGNORE_LIST,
  INCLUDE_INITIATOR,
  INCLUDE_SERVER_IP,
  MATCH_COUNT_MIN,
  FILTER_SAME_HOST_URL,
  FILTER_TIMESTAMPS,
  FILTER_URL_VALUES,
  FIRST_CHAR_MIN_LEN,
  FIRST_CHAR_MAX_LEN,
  REPORT_PARAMS,
  IGNORE_SAME_REQUESTS,
} = require('./parser.config');




// Initiate Parsing of File
const sharedStrings = async (har) => {

  /* PARSER GLOBALS */
  let report = {};
  let final = {};
  let pages = {};
  let iterations = 0;
  /* -------------- */

  try {
    /*
      fn - findSharedStrings 
      desc - First, iterate over entries and extract all the entry strings,
      then call call searchStrings to try and match in all of the entries.
    */
    const findSharedStrings = (entries) => {
      let pageFilter = sameDomainValueFilter(Object.keys(pages));
      for (level of LEVELS) {
        entries.map((entry, index) => {
          for (type of ENTRY_TYPES) {
            // example -> entry['request']['headers']
            if (entry[level][type]) {
              for (first of entry[level][type]) {
                iterations++;
                if (
                  first && (first.value.length > FIRST_CHAR_MIN_LEN && first.value.length < FIRST_CHAR_MAX_LEN)
                  && !isCookieHeader(type, first, IGNORE)
                  && !pageFilter[first.value]
                ) {
                  first.esc = escapeRegExp(first.value);
                  searchEntries(entries, index, first, entry.request.url, level)
                }
              }
            }
          }
        })
      }
      console.log("\nEntry Count: ", iterations)
    }

    /*
      fn - searchEntries
      desc - Same iteration logic as above, just has additional logic for skipping entries,
      string matching, and creating report.
    */
    const searchEntries = (entries, index, first, level) => {
      for (_level of LEVELS) {
        let currentPage = null;
        let key = null;
        let _index = -1;
        for (_entry of entries) {
          _index += 1
          // Set The Current Page
          if (pages[_entry['request'].url] && _entry['request'].method === 'GET') {
            currentPage = _entry['request'].url;
          }
          // If first loop and second loop are on the same index, skip the iteration.
          // This will trigger false matches because they are on identical entries.
          if (index === _index && _level === level) continue;
          for (_type of ENTRY_TYPES) {
            if (_entry[_level][_type]) {
              for (second of _entry[_level][_type]) {
                if (second && (second.value.length > 7) && !isCookieHeader(_type, second, IGNORE)) {
                  try {
                    // Do a string regex match of the first and second value.
                    if (compareEntries(first, second)) {
                      key = first.value;

                      // Ignore duplicated request matches
                      if (isDuplicate(report, key, currentPage, _entry, second)) {
                        continue;
                      }

                      // Build the report object.
                      report[key] = {
                        count: setCount(report[key]),
                        value: first.value,
                        urls: setMatchProfiles(report[key], _entry, second.name, second.value, _type, _level, currentPage),
                      }

                      // Add to report if match count is met.
                      if (report[key].count >= MATCH_COUNT_MIN) {
                        final[key] = report[key]
                      }
                    }
                  } catch (error) {
                    console.log("Error: ", error, "First: ", first)
                    throw new Error(error)
                  }
                }
              }
            }
          }
        }
      }
    }

    // --------------------------------------------
    // ANONYMOUS FUNCTION TO TRIGGER PARSING SCRIPT
    // --------------------------------------------
    (() => {
      // Start timer
      let t1 = Date.now();

      // Extract entries from HAR file
      const { log: { entries } } = har;

      // Determine the pages in HAR session
      pages = setPages(har);

      // Run shared strings parsing
      findSharedStrings(entries);

      // Filters for final report data - constants from parser.config.js
      if (FILTER_SAME_HOST_URL) {
        final = filterSameHostUrl(final);
      }
      if (FILTER_TIMESTAMPS) {
        final = filterTimestamps(final);
      }
      if (IGNORE_SAME_REQUESTS) {
        final = filterSameRequests(final);
      }
      if (FILTER_URL_VALUES) {
        final = filterUrlValues(final);
      }

      // Stop function timer
      let t2 = Date.now();
      console.log(`\n--- Excution Time: ${(t2 - t1) / 1000} seconds ---\n`)

    })();

    return final;

  } catch (error) {
    console.log("Shared Strings Error: ", error)
  }
}
/*
  ---------------------------------------------
  --- Below are utility funtions for parser ---
  ---------------------------------------------
*/

const compareEntries = (first, second) => {
  try {

    if (second.value.match(first.esc)) {
      return true
    } else return false;
  } catch (error) {
    console.log("FALSE: ", error)
    return false;
  }
}

// Set the current page the parser is on so that it may be added to the report.
const setPages = ({ log }) => {
  let pagesObj = {};

  if (log.pages[0] && !log.pages[0].title && log.browser.name === 'Firefox') {
    let url = log.entries[0].request.url;
    pagesObj[url] = true;
  }

  for (page of log.pages) {
    if (page.title) {
      pagesObj[page.title] = true;
    }
  }
  console.log("\nPages: ", pagesObj)
  return pagesObj;
};

// Count the number of times the specific string was found
const setCount = (reportKey) => ((reportKey && (reportKey.count > 0)) ? reportKey.count += 1 : 1);


// When a string is matched, this function will return an object that 
// contains information about the request/response it was found in.
const setMatchProfiles = (reportKey, _entry, name, value, type, _level, currentPage) => {

  let urls = null;
  let { _initiator, response: { redirectURL } } = _entry;
  let initiator = setInitiatorUrl(_initiator);
  let url = _entry.request.url;

  if (!reportKey || !reportKey['urls']) {
    urls = {
      [currentPage]: {
        [_entry.request.url]: {
          matches: [{ name, value, type, _level, url, redirectURL, initiator }]
        }
      }
    }
  } else if (!reportKey['urls'][currentPage]) {
    urls = {
      ...reportKey['urls'],
      [currentPage]: {
        [_entry.request.url]: {
          matches: [{ name, value, type, _level, url, redirectURL, initiator }]
        }
      }
    }
  } else if (!reportKey['urls'][currentPage][_entry.request.url]) {
    urls = {
      ...reportKey['urls'],
      [currentPage]: {
        ...reportKey['urls'][currentPage],
        [_entry.request.url]: {
          matches: [{ name, value, type, _level, url, redirectURL, initiator }]
        }
      }
    }
  } else {
    urls = {
      ...reportKey['urls'],
      [currentPage]: {
        ...reportKey['urls'][currentPage],
        [_entry.request.url]: {
          matches: [
            ...reportKey['urls'][currentPage][_entry.request.url].matches,
            { name, value, type, _level, url, redirectURL, initiator }
          ]
        }
      }
    }
  }
  return urls
}

const setInitiatorUrl = (_initiator) => {
  if (_initiator) {
    if (_initiator.url) {
      return _initiator.url
    } else if (_initiator.stack) {
      if (_initiator.stack.callFrames[0]) {
        for (let i = 0; i < _initiator.stack.callFrames.length; i++) {
          if (_initiator.stack.callFrames[i].url) {
            return _initiator.stack.callFrames[i].url;
          }
        }
      }
      if (_initiator.stack.parent) {
        if (_initiator.stack.parent.callFrames) {
          for (let i = 0; i < _initiator.stack.parent.callFrames.length; i++) {
            if (_initiator.stack.parent.callFrames[i].url) {
              return _initiator.stack.parent.callFrames[i].url;
            }
          }
        }
      }
    }
  }
  return '';
}

// Filter the same requests because it will bloat the report with redundant data
const filterSameRequests = (final) => {

  console.log("\n--- Filtering Report Same Requests ---\n");

  let urls = null
  let request = null;

  for (entry in final) {
    urls = Object.keys(final[entry].urls);
    if (urls.length === 1) {
      request = Object.keys(final[entry].urls[urls[0]]);
      if (request.length === 1) {
        delete final[entry];
      }
    }
  }
  return final
}

const filterTimestamps = (final) => {
  for (entry in final) {
    if (entry.substring(0, 2) == '15' && (entry.length === 13 || entry.length === 10) && !Number.isNaN(Number(entry))) {
      delete final[entry];
    }
  }
  return final
}

const filterUrlValues = (final) => {
  for (entry in final) {
    try {
      if (URL(entry).hostname) {
        delete final[entry];
      }
      return final
    } catch (error) {
      console.log("error: ", error)
      return final
    }
  }
}

// TODO: Rnadom erro in here - sometimes there are no urls for a string match, 
// doesn't seem to affect total output though...
const filterSameHostUrl = (final) => {
  let pages = [];
  let urls = [];
  let host = null;

  try {
    for (entry in final) {
      let matchCount = 0;

      pages = Object.keys(final[entry].urls).map(page => page)

      pages.map(page => {
        try {
          urls = Object.keys(final[entry].urls[page]);
        } catch (error) {
          console.log("Filter Host Url ERROR: ", entry, final[entry])
        }

        if (urls.length) {

          host = parseUrl.parse(urls[0]).hostname;

          urls.map(function (url) {
            if (parseUrl.parse(url).hostname === host) {
              matchCount += 1;
            }
          })
          if (matchCount === urls.length) {
            delete final[entry];
          }
        }
      })
    }
  } catch (error) {
    console.log("filterSameHostUrl Error: ", error)
  }
  return final
}

// Skip any values that are just the same value as the url of the page
const sameDomainValueFilter = (pages) => {
  let filter = {}

  try {
    let rules = (page) => {
      let host;
      if (page.substring(0, 4) == 'http') {
        host = new URL(page).hostname;
      } else {
        host = page;
      }
      return ([
        host,
        page,
        `${page}/`,
        `${host}/`,
        `${host.replace('https://', '').replace('www.', '')}`,
        `www.${host}`,
        `www.${host}/`,
        `https://${host}`,
        `https://www.${host}`,
        `https://www.${host}/`,
        `https://www.${host}`,
        encodeURIComponent(host),
        encodeURIComponent(page),
        encodeURIComponent(`www.${host}/`),
        encodeURIComponent(`https://${host}`),
        encodeURIComponent(`https://${host}/`),
        encodeURIComponent(`https://www.${host}`),
        encodeURIComponent(`https://www.${host}/`),
        encodeURIComponent(`${page.replace('https://', '').replace('www.', '')}`),
      ])
    }

    for (page of pages) {
      let ruleset = rules(page);
      for (rule of ruleset) {
        filter[rule] = true;
      }
    }

  } catch (error) {
    console.log('isSameDomainValue Error: ', error)
  }
  return filter
}

const isDuplicate = (report, key, currentPage, _entry, second) => {
  if (report[key] && report[key]['urls'][currentPage]) {
    if (report[key]['urls'][currentPage][_entry.request.url]) {
      if (report[key]['urls'][currentPage][_entry.request.url].matches) {
        for (match of report[key]['urls'][currentPage][_entry.request.url].matches) {
          if (second.name === match.name) {
            return true;
          }
        }
      }
    }
  }
  return false
}


const isCookieHeader = (type, entryType, IGNORE) => (IGNORE[entryType.name] || (type === 'header' && entryType.name === 'cookie'));

const IGNORE = {
  "Age": true,
  "age": true,
  "Accept": true,
  "accept": true,
  "Accept-Language": true,
  "Accept-Encoding": true,
  "accept-ch-lifetime": true,
  "accept-language": true,
  "accept-encoding": true,
  "Access-Control-Allow-Headers": true,
  "access-control-allow-headers": true,
  "Access-Control-Allow-Origin": true,
  "access-control-allow-origin": true,
  "access-control-expose-headers": true,
  "Access-Control-Allow-Methods": true,
  "access-control-allow-methods": true,
  "Access-Control-Expose-Headers": true,
  "access-control-expose-headers": true,
  "Access-Control-Request-Headers": true,
  "access-control-request-headers": true,
  "Allow": true,
  "allow": true,
  "alt-svc": true,
  "amp-access-control-allow-source-origin": true,
  "ASP.NET_SessionId": true,
  "cdn-cachedat": true,
  "Cache-Control": true,
  "Cache-control": true,
  "cache-control": true,
  "Cf-Bgj": true,
  "cg1": true,
  "Connection": true,
  "content-disposition": true,
  "content-encoding": true,
  "Content-Security-Policy": true,
  "content-security-policy": true,
  "Content-Type": true,
  "Content-type": true,
  "content-type": true,
  "cookie": true,
  "data%20": true,
  "Date": true,
  "date": true,
  "date": true,
  "ETag": true,
  "Etag": true,
  "etag": true,
  "expect-ct": true,
  "Expires": true,
  "expires": true,
  "guci": true,
  "Host": true,
  "host": true,
  "host_url": true,
  "If-Modified-Since": true,
  "if-range": true,
  "Keep-Alive": true,
  "keep-alive": true,
  "Last-Modified": true,
  "last-modified": true,
  "link": true,
  "Max-Age": true,
  ":method": true,
  "Origin": true,
  "origin": true,
  "outputType": true,
  "P3P": true,
  "P3p": true,
  "p3p": true,
  "pageURL": true,
  ":path": true,
  "Pragma": true,
  "pragma": true,
  "Range": true,
  "range": true,
  "ref": true,
  "Referer": true,
  "referer": true,
  "Referrer": true,
  "referrer": true,
  "referrer-policy": true,
  "resolution": true,
  ":scheme": true,
  "screen": true,
  "Sec-Fetch-Mode": true,
  "sec-fetch-mode": true,
  "Sec-Fetch-Site": true,
  "sec-fetch-site": true,
  "Server": true,
  "server": true,
  "server-timing": true,
  "Set-Cookie": true,
  "set-cookie": true,
  "Strict-Transport-Security": true,
  "strict-transport-security": true,
  "TE": true,
  "test_cookie": true,
  "timing-allow-origin": true,
  "upgrade-insecure-requests": true,
  "User-Agent": true,
  "user-agent": true,
  "utf8": true,
  "Vary": true,
  "vary": true,
  "ver": true,
  "Via": true,
  "via": true,
  "x-amz-meta-alexa-last-modified": true,
  "x-amz-replication-status": true,
  "x-amz-storage-class": true,
  "X-Application-Context": true,
  "x-application-context": true,
  "X-AspNet-Version": true,
  "x-aspnet-version": true,
  "x-ms-blob-type": true,
  "x-content-type-options": true,
  "X-Cache": true,
  "x-cache": true,
  "x-datacenter": true,
  "x-be": true,
  "X-Frame-Options": true,
  "x-frame-options": true,
  "x-goog-storage-class": true,
  "x-amz-meta-mtime": true,
  "x-ms-version": true,
  // Wordpress headers
  "x-ac": true,
  "x-nc": true,
  // ---------------
  "X-Moz": true,
  "x-moz": true,
  "x-ms-lease-status": true,
  "X-Originating-URL": true,
  "X-Powered-By": true,
  "x-powered-by": true,
  "x-referring-url": true,
  "X-Requested-With": true,
  "x-requested-with": true,
  "X-Robots-Tag": true,
  "X-Server": true,
  "x-server": true,
  "X-Served-By": true,
  "x-served-by": true,
  "X-Server-Name": true,
  "x-server-name": true,
  "X-Soa": true,
  "x-soa": true,
  "x-timer": true,
  "X-XSS-Protection": true,
  "X-Xss-Protection": true,
  "x-xss-protection": true,
  ":authority": true,

  // ---------------
  // CNN_KEYS
  // ---------------
  "family": true,
  "p_screen_res": true,
  "prev_scp": true,
  "slot": true,
  "slots": true,
  "tk_flint": true,
  "wv": true,
  "x-servedbyhost": true,


  // ---------------
  //  NY-TIMES-KEYS
  // ---------------
  "assetUrl": true,
  "assetData": true,
  "callback": true,
  "cd1": true,
  "cd2": true,
  "d": true,
  "dl": true,
  "dt": true,
  "c7": true,
  "c8": true,
  "g1": true,
  "g0": true,
  "h": true,
  "p": true,
  "proxyEventType": true,
  "vp": true,
  "sr": true,
  "x-backend-name": true,
  "x-nyt-pagetype": true,
  "x-goog-stored-content-encoding": true,
  "x-nyt-gcs-bucket": true,

  // ---------------------
  //  WASHINGTON-POST-KEYS
  // ---------------------

  "content_type": true,
  "contentUri": true,
  "ecs": true,
  "ohc-response-time": true,
  "pageName": true,
  "pwapi_contentsection": true,
  "rplampr": true,
  "s_lv_s": true,
  "Server-Info": true,
  "status": true,
  "uri": true,
  "x-via": true,
  "X-CDN-Backend": true,
  "wp_ak_v_m": true,

}

/**
 * Searching RegExp Patters 
 * Copy in the VSCode Find/Search field
 * IPV4 - (([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])
 */

module.exports = { sharedStrings };

