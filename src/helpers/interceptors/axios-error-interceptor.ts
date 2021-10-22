import requireInjected from '../../require-injected';
import { AxiosError } from '../../middlewares/errors/axios-error';

export default () => {
  const axios = requireInjected('axios');
  axios.default.interceptors.response.use(
    res => res,
    err => Promise.reject(new AxiosError(err))
  );
};
