export class DuplicateWaitlistEmailError extends Error {
  constructor() {
    super("Email already joined the beta waitlist");
    this.name = "DuplicateWaitlistEmailError";
  }
}

export class InvalidWaitlistApplicationError extends Error {
  constructor() {
    super("Waitlist application validation failed");
    this.name = "InvalidWaitlistApplicationError";
  }
}
