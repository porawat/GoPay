import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';
class SettingHttpService extends HTTPCore {
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
    getSettings() {
        let config = this.getHeaders();
        let url = this.getEnv();
        let path = `/settings`;
        let fullUrl = url + path;
        return this.get(fullUrl, config);
    }
}

export { SettingHttpService };