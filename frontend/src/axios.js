import _axios from "axios"

const axios = (baseURL) => {
    return _axios.create({
        baseURL: baseURL || 'http://localhost:8000',
        timeout: 1000,
    })
}
export {axios};
export default axios();