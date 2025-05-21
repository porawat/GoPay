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
        return this.post(path, data, config);
    }
    joinShop(data) {
        let config = this.getHeaders();
        let path = `${API_URL}/join/${data}`;
        console.log(config, path)
        return this.get(path, config);
    }
    getShopById(data) {
        console.log("getShopById ==> " + data)
        let config = this.getHeaders();
        let path = `${API_URL}/shop/${data}`;
        console.log(config, path)
        return this.get(path, config);
    }
}

export { ShopHttpService };
