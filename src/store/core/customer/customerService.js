import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';
class CutomerHttpService extends HTTPCore {
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
    createCustomer(param) {
        let config = this.getHeaders();
        let url = this.getEnv();
        let path = `/customer`;
        let fullUrl = url + path;
        return this.post(fullUrl, param, config);
    }
    getCustomer(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/customer/${param}`;
        console.log("part ==> " + path)
        return this.get(path, config);
    }
    updateCustomer(param) {
        let config = this.getHeaders();
        let url = this.getEnv();
        let path = `/customerupdate`;
        let fullUrl = url + path;
        return this.put(fullUrl, param, config);
    }
    getCustomerByShop(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/customer/${param}`;
        console.log("part ==> " + path)
        return this.get(path, config);
    }
    getCustomerById(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/customer/${param}`;
        console.log("part ==> " + path)
        return this.get(path, config);
    }

}

export { CutomerHttpService };