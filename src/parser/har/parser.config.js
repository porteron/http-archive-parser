// HAR Parser Config
const config = {
    LEVELS: [
        'request',
        'response'
    ],
    ENTRY_TYPES: [
        'headers',
        'cookies',
        'queryString'
    ],
    FIRST_CHAR_MIN_LEN: 7,
    FIRST_CHAR_MAX_LEN: 200,
    REPORT_KEY_NAME_MAX_LENGTH: 60,
    REPORT_URL_MAX_LENGTH: 120,
    INCLUDE_INITIATOR: true,
    INCLUDE_SERVER_IP: false,
    MATCH_COUNT_MIN: 2,
    IGNORE_LIST: [],
    INCLUDE_LIST: [],
    REPORT_PARAMS: [],
    IGNORE_SAME_REQUESTS: true,
    FILTER_SAME_HOST_URL: true,
    FILTER_TIMESTAMPS: true,
    FILTER_URL_VALUES: false,
}

module.exports = config;
