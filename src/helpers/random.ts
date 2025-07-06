import OtpGenerator from 'otp-generator';
export class RandomNumbers {
  private readonly length: number;

  constructor(length: number = 6) {
    this.length = length;
  }

  get value() {
    return OtpGenerator.generate(this.length, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
  }
}
