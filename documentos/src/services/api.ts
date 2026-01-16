// src/services/api.js
import axios from "axios";
import { useState } from "react";

export const api = () => {
  const [loading, setLoading] = useState(false);
  const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  var base = '' 


  if (isLocalhost) {
    base = "http://127.0.0.1:8000/api/"
  } else {
    base = "https://api-globaltty3-little-sea-9182.fly.dev/api/"
  }
  const api = axios.create({
    baseURL: base, // Substitua pela sua URL
  });

  api.interceptors.request.use(
    (config) => {
      setLoading(true);
      return config;
    },
    (error) => {
      setLoading(false);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      setLoading(false);
      return response;
    },
    (error) => {
      setLoading(false);
      return Promise.reject(error);
    }
  );

  return { api, loading };
};
