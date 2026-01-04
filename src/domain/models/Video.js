export class Video {
  constructor(props) {
    Object.assign(this, props);
    this.watchTime ??= 0;
    this.duration ??= 0;
    this.isCompleted ??= false;
  }

  updateWatchTime(seconds) {
    if (seconds < 0) {
      throw new Error('Watch time cannot be negative');
    }

    this.watchTime = Math.max(this.watchTime, seconds);

    if (this.duration > 0) {
      this.isCompleted = this.watchTime >= this.duration;
    }
  }

  completionPercentage() {
    if (!this.duration) return 0;
    return Math.min(
      Math.round((this.watchTime / this.duration) * 100),
      100
    );
  }
}
