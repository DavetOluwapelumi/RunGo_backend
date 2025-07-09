export class EmailDispatch {
  private readonly subject: string;
  private readonly recipient: string;
  private readonly data: Record<string, any>;
  constructor(subject: string, recipient: string, data: Record<string, any>) {
    this.subject = subject;
    this.recipient = recipient;
    this.data = data;
  }

  async send() {
    throw new Error('Method not implemented.');
  }
}
