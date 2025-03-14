export class ApiResponse<T> {
  private data: T;
  private message = '';
  constructor(message = '', data: T) {
    this.data = data;
    this.message = message;
  }
}
