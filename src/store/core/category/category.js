//fronend/store/code/product/category.js
import axios from 'axios';
import { API_URL } from '../../../config/config';

export class CategoryHttpService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL || import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3030/api',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  async getCategories() {
    try {
      const url = '/category';
      console.log('Fetching categories from:', this.apiClient.defaults.baseURL + url);
      const response = await this.apiClient.get(url);
     // console.log('Category API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}