import _axios from "axios"

const axios = (token) => {
    if(token) _axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return _axios.create({
        baseURL: 'http://localhost:8000',
        timeout: 10000,
    })
}
export default axios;