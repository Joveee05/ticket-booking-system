export default class RootService {
  processResponse(payload: {
    statusCode: number;
    message: string;
    cookie?: string;
    data?: any;
  }) {
    const { statusCode, message, cookie, data } = payload;
    return { statusCode, message, cookie, data };
  }
}
