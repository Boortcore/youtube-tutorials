import { isPromiseLike, asap, arrayRequeredMessage, allPromisesRejectedMessage, AggregateError, Status } from "./utils";

type Initializer<T> = (resolve: Resolve<T>, reject: Reject) => void;

type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;

type ThenCb<T, R = any> = (value: T) => R | PromiseLike<R>;
type CatchCb = (reason?: any) => any;
type StatusTypes = typeof Status[keyof typeof Status];

type AllSettledResult<T> =
  | {
      status: typeof Status.FULFILLED;
      value: T;
    }
  | {
      status: typeof Status.REJECTED ;
      reason: any;
    };

export default class MyPromise<T> {
  private thenCbs: [ThenCb<T> | undefined, CatchCb | undefined, Resolve<any>, Reject][] = [];
  private status: StatusTypes = Status.PENDING;
  private handled = false;
  private value: T | null = null;
  private error?: any;

  constructor(initializer: Initializer<T>) {
    try {
      initializer(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  static all<U>(promises: (U | PromiseLike<U>)[]): MyPromise<U[]> {
    if (!Array.isArray(promises)) {
      return MyPromise.reject(new TypeError(arrayRequeredMessage));
    }
    if (!promises.length) {
      return MyPromise.resolve([]);
    }
    const result: U[] = Array(promises.length);
    let count = 0;

    return new MyPromise<U[]>((resolve, reject) => {
      promises.forEach((p, index) => {
        MyPromise.resolve(p)
          .then((value) => {
            result[index] = value;
            count++;

            if (count === promises.length) {
              resolve(result);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  static any<U>(promises: (U | PromiseLike<U>)[]): MyPromise<U> {
    if (!Array.isArray(promises)) {
      return MyPromise.reject(new TypeError(arrayRequeredMessage));
    }
    if (!promises.length) {
      return MyPromise.reject(new AggregateError(allPromisesRejectedMessage));
    }
    let count = 0;
    return new MyPromise<U>((resolve, reject) => {
      promises.forEach((p) => {
        MyPromise.resolve(p)
          .then(resolve)
          .catch(() => {
            count++;
            if (count === promises.length) {
              reject(new AggregateError(allPromisesRejectedMessage));
            }
          });
      });
    });
  }

  static allSettled<U>(promises: (U | PromiseLike<U>)[]): MyPromise<AllSettledResult<U>[]> {
    if (!Array.isArray(promises)) {
      return MyPromise.reject(new TypeError(arrayRequeredMessage));
    }
  
    const wrappedPromises = promises.map((p) =>
      MyPromise.resolve(p)
        .then(
          (value): AllSettledResult<U> => ({
            status: Status.FULFILLED,
            value,
          })
        )
        .catch(
          (reason): AllSettledResult<U> => ({
            status: Status.REJECTED,
            reason,
          })
        )
    );
  
    return MyPromise.all(wrappedPromises);
  }

  static race<U>(promises: (U | PromiseLike<U>)[]): MyPromise<U> {
    if (!Array.isArray(promises)) {
      return MyPromise.reject(new TypeError(arrayRequeredMessage));
    }

    return new MyPromise<U>((resolve, reject) => {
      promises.forEach((p) => {
        MyPromise.resolve(p).then(resolve).catch(reject);
      });
    });
  }

  static resolve<U>(value: U | PromiseLike<U>): MyPromise<U> {
    return new MyPromise<U>((resolve) => {
      resolve(value);
    });
  }

  static reject(reason?: any): MyPromise<never> {
    return new MyPromise<never>((_, reject) => {
      reject(reason);
    });
  }

  then<R = T>(onResolve?: ThenCb<T, R>, onReject?: CatchCb): MyPromise<R> {
    this.handled = true;
    return new MyPromise<R>((resolve, reject) => {
      this.thenCbs.push([onResolve, onReject, resolve, reject]);
      this.processNextTasks();
    });
  }

  catch<R = never>(onReject: CatchCb): MyPromise<R | T> {
    return this.then(undefined, onReject);
  }

  finally(callback: () => void): MyPromise<T> {
    const call = (result: unknown, failed = false) => 
      MyPromise.resolve(callback()).then(() => (failed ? MyPromise.reject(result) : result));

    return this.then(
      (value) => call(value) as T,
      (reason) => call(reason, true) as T
    );
  }

  private resolve = (value?: T | PromiseLike<T>): void => {
    if (this.status !== Status.PENDING) {
      return;
    }
    if (isPromiseLike(value)) {
      value.then(this.resolve, this.reject);
    } else {
      this.status = Status.FULFILLED;
      this.value = value ?? null;
      this.processNextTasks();
    }
  };

  private reject = (error: any): void => {
    if (this.status !== Status.PENDING) {
      return;
    }
    this.status = Status.REJECTED;
    this.error = error;
    this.processNextTasks();
  };

  private processNextTasks(): void {
    if (this.status === Status.PENDING) {
      return;
    }

    // Условие на случай, если reject не обработан (отсутствуют колбэки, переданные в catch). В таком случае нативный промис выбросит необработанную ошибку. Повторяем это поведение.
    if (this.status === Status.REJECTED) {
      asap(() => {
        if (!this.handled) {
          throw this.error;
        }
      });
    }

    const thenCbs = this.thenCbs;
    this.thenCbs = [];

    asap(() => {
      thenCbs.forEach(([thenCb, catchCb, resolve, reject]) => {
        try {
          if (this.status === Status.FULFILLED) {
            const value = thenCb ? thenCb(this.value as T) : this.value;
            resolve(value);
          } else {
            if (catchCb) {
              const value = catchCb(this.error);
              resolve(value);
            } else {
              reject(this.error);
            }
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
