import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
});

API.interceptors.request.use(async (config) => {
  // const value = await AsyncStorage.getItem("your key");
  // if (value !== null) {
  //   config.headers["Authorization"] = `Bearer ${value}`;
  // }
  return config;
});

export default API;
