import axios from 'axios';
import { API_URL } from '../../../config/config';

export class WarehouseHttpService {
  constructor() {
    const baseURL = API_URL || import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';
    console.log('WarehouseHttpService baseURL:', baseURL); // Debug baseURL
    this.apiClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  async getWarehouses(shopId) {
    if (!shopId) throw new Error('shopId is required');
    try {
      const url = `/warehouses?shopId=${shopId}`;
      console.log('Fetching warehouses from:', this.apiClient.defaults.baseURL + url);
      const response = await this.apiClient.get(url);
      console.log('Warehouse API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }
}