const objectMap = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

export const reverseLookup = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

export const copyAddKeyValue = (obj, key, value) => {
  var objCopy = { ...obj };
  objCopy[key] = value;
  return objCopy;
};
