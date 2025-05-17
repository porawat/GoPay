import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';
class ProductHttpService extends HTTPCore {
    constructor() {
        super({});
    }
    getEnv() {
        return import.meta.env.VITE_API_ENDPOINT;
    }
    getToken() {
        return localStorage.getItem("token");
    }
    getHeaders() {
        return {
            headers: {
                Authorization: `Bearer ${this.getToken()}`,
                "Content-Type": "multipart/form-data",
            },
        };
    }

    // ==============================
    Createproduct(param) {
        let config = this.getHeaders();
        let url = this.getEnv();
        let path = `/product`;
        let fullUrl = url + path;
        return this.post(fullUrl, param, config);
    }

    getproduct(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/product/${param}`;
        console.log(config, path)
        return this.get(path, config);
    }
}

export { ProductHttpService };