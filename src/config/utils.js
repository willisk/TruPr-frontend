import { Twitter } from '@mui/icons-material';
const icons = {
  Twitter: Twitter,
};

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

export const dateDiffInDays = (task) => {
  let prefix = '';
  let suffix = '';
  const a = new Date(task.startDate * 1000);
  const b = new Date(task.endDate * 1000);
  const c = new Date();
  if (new Date() > b) {
    return '-';
  }

  if (new Date() < a) {
    prefix = 'Starts in ';
    suffix = ' days';
  } else {
    suffix = ' days left';
  }
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const today = Date.UTC(c.getFullYear(), c.getMonth(), c.getDate());

  
  let res = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));

  if (prefix !== '') {
    res = Math.floor((utc1 - today) / (1000 * 60 * 60 * 24));
  }

  return prefix + res + suffix;
};

export const getProgressValue = (task) => {
  const val = Math.round(
    ((new Date() - new Date(task.startDate * 1000)) /
      (new Date(task.endDate * 1000) - new Date(task.startDate * 1000))) *
      100
  );
  return val > 100 ? 100 : val;
};

export const getIcon = (icon) => {
  const DynamicIcon = icons[icon];
  let extra = {};
  if (icon === 'Twitter') {
    extra = {
      padding: '8px',
      borderRadius: '50%',
      background: '#54b2f5',
      color: 'white',
    };
  }
  return <DynamicIcon style={{ display: 'inline-block', verticalAlign: 'middle', ...extra }} />;
};

export const getReadableDate = (d) => {
  return d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
};

export const getTaskState = (task) => {
  if (task.status == 0) return 'Cancelled';
  if (task.status == 1 && task.startDate * 1000 <= new Date().getTime() && new Date().getTime() < task.endDate * 1000)
    return 'Open';
  return 'Closed';
};
