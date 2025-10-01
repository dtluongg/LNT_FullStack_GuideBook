import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // đổi sang baseUrl production khi deploy
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
