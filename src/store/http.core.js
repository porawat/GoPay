import axios from 'axios';

class HTTPCore {
  api;
  constructor({ }) {
    this.api = axios;
  }

  async post(path = '/', data = {}, config = {}) {
    return this.api.post(path, data, config).then(_processData);
  }

  get(path = '/', config = {}) {
    return this.api.get(path, config).then(_processData);
  }

  put(path = '/', data = {}, config = {}) {
    return this.api.put(path, data, config).then(_processData);
  }

  patch(path = '/', data = {}, config = {}) {
    return this.api.patch(path, data, config).then(_processData);
  }

  delete(path = '/', config = {}) {
    return this.api.delete(path, config).then(_processData);
  }
}

const _processData = res => res.data;

export default HTTPCore;
