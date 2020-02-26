const flatten = function (obj) {

  let flatObj = {};
  let keyName = '';

  checkLevels(keyName, obj, 0);

  function checkLevels(keyName, nested, i) {

    let keys = Object.keys(nested);

    for (let key of keys) {
      i++

      if (!keyName) {
        keyName = key;
      } else {
        keyName += `_${key}`
      }

      if (nested[key] instanceof Object) {
        // We can assume object
        checkLevels(keyName, nested[key], i);
      } else {
        flatObj[keyName] = nested[key];
        keyName = keyName.replace(`_${key}`, '')
      }
      if (i < keys.length) {
        keyName = '';
      }
    }
  }
  return flatObj;
}

module.exports = flatten;