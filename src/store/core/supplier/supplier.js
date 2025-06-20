import axios from 'axios';
import { API_URL } from '../../../config/config';
import HTTPCore from '../../http.core';
 class SupplierHttpService  extends HTTPCore {
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
                 'Content-Type': 'application/json',
            },
        };
    }

  async getSuppliers() {
     let config = this.getHeaders();
     let url = import.meta.env.VITE_API_ENDPOINT;
        let path = `${url}/supplier`;
        return this.get(path, config);
  }
}

export {SupplierHttpService}