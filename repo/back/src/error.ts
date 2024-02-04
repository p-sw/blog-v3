class HttpException extends Error {
  constructor(
    public status: number,
    public code: string
  ) {
    super(`${status}: ${code}`);
  }
}

export class BadRequest extends HttpException {
  constructor(public code: string) {
    super(400, code);
  }
}

export class Unauthorized extends HttpException {
  constructor(public code: string) {
    super(401, code);
  }
}

export class Forbidden extends HttpException {
  constructor(public code: string) {
    super(403, code);
  }
}

export class NotFound extends HttpException {
  constructor(public code: string) {
    super(404, code);
  }
}

export class InternalServerError extends HttpException {
  constructor(public code: string) {
    super(500, code);
  }
}

const errors = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError,
};

export default errors;
