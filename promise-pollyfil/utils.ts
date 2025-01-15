export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "then" in value &&
      typeof value.then === "function"
  );
}

function createAsap() {
  if (typeof MutationObserver === "function") {
    return function asap(callback: () => void) {
      const observer = new MutationObserver(function () {
        callback();
        observer.disconnect();
      });
      const target = document.createElement("div");
      observer.observe(target, { attributes: true });
      target.setAttribute("data-foo", "");
    };
  } else if (
    typeof process === "object" &&
    typeof process.nextTick === "function"
  ) {
    return function asap(callback: () => void) {
      process.nextTick(callback);
    };
  } else if (typeof setImmediate === "function") {
    return function asap(callback: () => void) {
      setImmediate(callback);
    };
  } else {
    return function asap(callback: () => void) {
      setTimeout(callback, 0);
    };
  }
}

export const asap = createAsap();

export class AggregateError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const arrayRequeredMessage = 'The method of Promise requires an array';
export const allPromisesRejectedMessage = 'All promises were rejected';

export const Status  = {
  PENDING: "pending" ,
  FULFILLED: "fulfilled",
  REJECTED: "rejected"
} as const;