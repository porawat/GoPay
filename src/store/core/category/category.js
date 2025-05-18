import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';
class CategoryHttpService extends HTTPCore {
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

    getCategory(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/category`;
        console.log(config, path)
        return this.get(path, config);
    }
}

export { CategoryHttpService };