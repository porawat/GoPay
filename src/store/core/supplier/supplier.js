import axios from 'axios';
import { API_URL } from '../../../config/config';

export class SupplierHttpService {
  constructor() {
    const baseURL = API_URL || import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';
    console.log('SupplierHttpService baseURL:', baseURL); // Debug baseURL
    this.apiClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  async getSuppliers() {
    try {
      const url = '/suppliers';
      console.log('Fetching suppliers from:', this.apiClient.defaults.baseURL + url);
      const response = await this.apiClient.get(url);
      console.log('Supplier API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }
}