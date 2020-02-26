const getLocation = require("./iplocation");
const deviceParser = require("./device-parser");

const generateMetadata = async request => {
  const requestData = validateRequestFields(request.body);

  const {
    name,
    collection_source,
    filetype,
    collection_time,
    filesize,
    process_type,
    project_name,
    sources,
    worker_id,
    assignment_id,
    hit_id,
    reward,
    task_type
  } = requestData;

  const {
    city = "",
    country = "",
    countryCode: country_code = "",
    isp = "",
    org = "",
    regionName: region_name = "",
    timezone = ""
  } = await getLocation(request.ip);

  const {
    browser_name = "",
    browser_version = "",
    browser_major = "",
    engine_version = "",
    os_name = "",
    os_version = "",
    device_vendor = "",
    device_model = "unknown",
    device_type = "",
    cpu_architecture = ""
  } = deviceParser(user_agent);
  
  const os = `${os_name}-${os_version}`;
  const device = device_model;
  const city_name = `${city}-${region_name}-${country}`;
  const browser = `${browser_name}-${browser_version}`;

  return new Promise(async (resolve, reject) => {
    const collectionEvent = {
      name,
      city: city_name,
      region: region_name,
      country,
      device,
      isp,
      filesize,
      os,
      browser,
      collection_time,
      timezone,
      processType: process_type,
      project_name,
      worker_id,
      collection_source,
      filetype,
      userAgent: user_agent,
      sources,
      session: session_id,
      assignment_id,
      reward,
      hit_id,
      api_key: api_key_id,
      task_type
    };

    resolve(collectionEvent);
  });
};

// Set default fields to make sure they are set
const validateRequestFields = body => {
  return {
    name: body.name || "",
    sources: body.sources || [],
    collection_source: body.collection_source || "",
    filetype: body.filetype || "",
    collection_time: body.collection_time || 0,
    filesize: body.filesize || "",
    worker_id: body.worker_id || "",
    assignment_id: body.assignment_id || "",
    hit_id: body.hit_id || "",
    reward: body.reward || "",
    process_type: body.process_type || "",
    project_name: body.project_name || "",
    task_type: body.task_type || ""
  };
};

module.exports = { generateMetadata };
