export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}
