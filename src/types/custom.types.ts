export type EventResponse<T> = {
  statusCode?: number;
  message?: string;
  data?: T;
};

export enum EventStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

export enum HTTP_STATUS_CODE {
  OK = 200,
  CREATED = 201,
  CONFLICT = 409,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
}

export type AuthResponse<T> = EventResponse<T> & {
  cookie?: string;
};

export type UserResponse<T> = EventResponse<T>;
