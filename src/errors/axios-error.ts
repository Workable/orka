import { CustomError } from './custom-error';
import * as axios from 'axios';
import { omit } from 'lodash';
import * as util from 'util';

export class AxiosError extends CustomError {
  public context: object;
  public status: number;
  public code?: string;
  public response?: Omit<axios.AxiosResponse, 'request' | 'config'>;

  constructor(err: axios.AxiosError) {
    if (err.response) {
      super(
        `Error while requesting ${err.config?.method}: ${err.config?.url}, ` +
          `responded with ${err.response.status}, ${err.response.statusText}`
      );
    } else if (err.request) {
      super(
        `Error while requesting ${err.config?.method}: ${err.config?.url},` +
          ` requested ${err.request}, ${err.message}`
      );
    } else {
      super(`Error while requesting ${err.config?.method}: ${err.config?.url}, ${err.message}`);
    }
    this.code = err.code;
    this.status = err.response?.status || 500;
    this.context = {
      response: omit(err.response, ['request', 'config']),
      requestData: err.response?.config?.data,
      method: err.config?.method
    };
    this.response = err.response ? omit(err.response, ['request', 'config']) : undefined;
  }

  public [util.inspect.custom]() {
    return { AxiosError: this.message };
  }
}
