export class Stopwatch {
  private start: Date

  public constructor() {
    this.start = new Date()
  }

  public startedAt() {
    return this.start
  }

  public elapsed() {
    return new Date().getTime() - this.start.getTime()
  }
}
