export class BaseResponseDto<T> {
  code: number;
  message: string;
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = '成功'): BaseResponseDto<T> {
    return new BaseResponseDto(200, message, data);
  }

  static error<T = any>(message: string, code = 400): BaseResponseDto<T> {
    return new BaseResponseDto(code, message, null as any);
  }
}