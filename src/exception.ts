export class BorderException extends Error {
  errorCode: number;

  constructor(message: string, errorCode = -1) {
    super(message);
    this.name = 'BorderException';
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, BorderException.prototype);
  }
}

export class BorderApiException extends BorderException {
  constructor(message: string, errorCode = -1) {
    super(message, errorCode);
    this.name = 'BorderApiException';
    Object.setPrototypeOf(this, BorderApiException.prototype);
  }
}

export class BorderSignatureException extends BorderException {
  constructor(message: string) {
    super(message);
    this.name = 'BorderSignatureException';
    Object.setPrototypeOf(this, BorderSignatureException.prototype);
  }
}
