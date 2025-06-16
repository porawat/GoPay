import axios from 'axios';

class HTTPCore {
  constructor(config) {
    this.client = axios.create(config);
  }

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default HTTPCore;