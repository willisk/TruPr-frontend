const objectMap = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

export const reverseLookup = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

export const copyAddKeyValue = (obj, key, value) => {
  var objCopy = { ...obj };
  objCopy[key] = value;
  return objCopy;
};

export const formatDuration = (delta) => {
  const time = parseInt(delta, 10);

  const days = Math.floor(time / (24 * 60 * 60));
  const hours = Math.floor((time - days * 24 * 60 * 60) / (60 * 60));
  const minutes = Math.floor((time - hours * (60 * 60)) / 60);
  const seconds = time - hours * (60 * 60) - minutes * 60;

  if (days > 0) return days + ' day' + (days > 1 ? 's' : '');
  if (hours > 0) return hours + ' hour' + (hours > 1 ? 's' : '');
  if (minutes > 0) return minutes + ' minutes' + (minutes > 1 ? 's' : '');
  if (seconds > 0) return seconds + ' seconds' + (seconds > 1 ? 's' : '');

  return 'None';
};
