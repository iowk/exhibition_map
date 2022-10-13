import _axios from "axios"
import { backendPath } from "./settings";

const axios = (token) => {
    if(token) _axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete _axios.defaults.headers.common["Authorization"];
    return _axios.create({
        baseURL: backendPath,
        timeout: 10000,
    })
}
export default axios;