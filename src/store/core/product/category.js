//frontend/store/core/product/category.js
import axios from 'axios';
import { API_URL } from '../../../config/config';

export class CategoryHttpService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL || import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api',
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
      console.log('Category API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      const url = '/category';
      const response = await this.apiClient.post(url, categoryData);
      console.log('Create Category Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      const url = `/category/${categoryId}`;
      const response = await this.apiClient.put(url, categoryData);
      console.log('Update Category Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId) {
    try {
      const url = `/category/${categoryId}`;
      const response = await this.apiClient.delete(url);
      console.log('Delete Category Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}