import chalk from 'chalk';

/**
 * Track and render hierarchical steps without emojis, similar to Claude Code tree output.
 */
export class StepTracker {
  constructor(title) {
    this.title = title;
    this.steps = [];
    this.statusOrder = {
      pending: 0,
      running: 1,
      done: 2,
      error: 3,
      skipped: 4
    };
    this.refreshCallback = null;
  }

  attachRefresh(callback) {
    this.refreshCallback = callback;
  }

  add(key, label) {
    if (!this.steps.find(s => s.key === key)) {
      this.steps.push({ key, label, status: 'pending', detail: '' });
      this._maybeRefresh();
    }
  }

  start(key, detail = '') {
    this._update(key, 'running', detail);
  }

  complete(key, detail = '') {
    this._update(key, 'done', detail);
  }

  error(key, detail = '') {
    this._update(key, 'error', detail);
  }

  skip(key, detail = '') {
    this._update(key, 'skipped', detail);
  }

  _update(key, status, detail) {
    const step = this.steps.find(s => s.key === key);
    if (step) {
      step.status = status;
      if (detail) {
        step.detail = detail;
      }
      this._maybeRefresh();
    } else {
      // If not present, add it
      this.steps.push({ key, label: key, status, detail });
      this._maybeRefresh();
    }
  }

  _maybeRefresh() {
    if (this.refreshCallback) {
      try {
        this.refreshCallback();
      } catch (_e) {
        // Ignore
      }
    }
  }

  render() {
    const lines = [];
    lines.push(chalk.cyan(this.title));

    for (const step of this.steps) {
      const { label, status, detail } = step;
      const detailText = detail?.trim() ?? '';

      let symbol;
      if (status === 'done') {
        symbol = chalk.green('●');
      } else if (status === 'pending') {
        symbol = chalk.green.dim('○');
      } else if (status === 'running') {
        symbol = chalk.cyan('○');
      } else if (status === 'error') {
        symbol = chalk.red('●');
      } else if (status === 'skipped') {
        symbol = chalk.yellow('○');
      } else {
        symbol = ' ';
      }

      let line;
      if (status === 'pending') {
        // Entire line light gray (pending)
        if (detailText) {
          line = `  ${symbol} ${chalk.gray(label)} ${chalk.gray(`(${detailText})`)}`;
        } else {
          line = `  ${symbol} ${chalk.gray(label)}`;
        }
      } else {
        // Label white, detail (if any) light gray in parentheses
        if (detailText) {
          line = `  ${symbol} ${chalk.white(label)} ${chalk.gray(`(${detailText})`)}`;
        } else {
          line = `  ${symbol} ${chalk.white(label)}`;
        }
      }

      lines.push(line);
    }

    return lines.join('\n');
  }
}
