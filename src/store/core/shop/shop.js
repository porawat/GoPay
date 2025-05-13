import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';


class ShopHttpService extends HTTPCore {
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
    CreateShop(param) {
        let url = this.getEnv();
        let path = `/login`;
        let fullUrl = url + path;
        return this.post(fullUrl, param);
    }

    getmyshop(data) {
        let config = this.getHeaders();
        let path = `${API_URL}/getmyshop`;
        console.log(config, path)

        //  let fullUrl = url + path;

        return this.post(path, data, config);
    }
}

export { ShopHttpService };
