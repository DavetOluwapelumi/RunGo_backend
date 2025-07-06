export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data: T;

  constructor(message = '', data: T) {
    this.success = true; // Always true for successful responses
    this.message = message;
    this.data = data;
  }
}
