type Task<T> = () => Promise<T>;

class IngestionQueue {
  private chain = Promise.resolve();

  enqueue<T>(task: Task<T>): Promise<T> {
    const run = this.chain.then(task, task);
    // asegurar serialización
    this.chain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}

export const ingestionQueue = new IngestionQueue();

