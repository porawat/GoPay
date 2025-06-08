import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';
class ProductMasterHttpService extends HTTPCore {
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
    createproductMaster(param) {
        let config = this.getHeaders();
        let url = this.getEnv();
        let path = `/productmaster`;
        let fullUrl = url + path;
        return this.post(fullUrl, param, config);
    }
    updateproductMaster(param) {
        let config = this.getHeaders();
        let url = this.getEnv();
        let path = `/updateproductmaster`;
        let fullUrl = url + path;
        return this.post(fullUrl, param, config);
    }
    getproductMaster(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/productmaster`;
        console.log(config, path)
        return this.get(path, config);
    }
    getproductMasterByid(param) {
        let config = this.getHeaders();
        let path = `${API_URL}/productmaster/productsbycategory/${param}`;
        return this.get(path, config);
    }
}

export { ProductMasterHttpService };