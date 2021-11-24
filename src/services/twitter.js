import axios from 'axios';
const baseURL = '/api/tweet';

const getUserId = ({ username }) => {
  const request = axios.get(`${baseURL}/${username}`);
  return request.then((response) => response.data);
};

export default { getUserId };
