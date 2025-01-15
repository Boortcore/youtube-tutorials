"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var Status = {
    PENDING: "pending",
    FULFILLED: "fulfilled",
    REJECTED: "rejected"
};
var MyPromise = /** @class */ (function () {
    function MyPromise(initializer) {
        var _this = this;
        this.thenCbs = [];
        this.status = Status.PENDING;
        this.handled = false;
        this.value = null;
        this.resolve = function (value) {
            if (_this.status !== Status.PENDING) {
                return;
            }
            if ((0, utils_1.isPromiseLike)(value)) {
                value.then(_this.resolve, _this.reject);
            }
            else {
                _this.status = Status.FULFILLED;
                _this.value = value;
                _this.processNextTasks();
            }
        };
        this.reject = function (error) {
            if (_this.status !== Status.PENDING) {
                return;
            }
            _this.status = Status.REJECTED;
            _this.error = error;
            _this.processNextTasks();
        };
        try {
            initializer(this.resolve, this.reject);
        }
        catch (error) {
            this.reject(error);
        }
    }
    MyPromise.all = function (promises) {
        if (!Array.isArray(promises)) {
            return MyPromise.reject(new TypeError(utils_1.arrayRequeredMessage));
        }
        if (!promises.length) {
            return MyPromise.resolve([]);
        }
        var result = Array(promises.length);
        var count = 0;
        return new MyPromise(function (resolve, reject) {
            promises.forEach(function (p, index) {
                MyPromise.resolve(p)
                    .then(function (value) {
                    result[index] = value;
                    count++;
                    if (count === promises.length) {
                        resolve(result);
                    }
                })["catch"](function (error) {
                    reject(error);
                });
            });
        });
    };
    MyPromise.any = function (promises) {
        if (!Array.isArray(promises)) {
            return MyPromise.reject(new TypeError(utils_1.arrayRequeredMessage));
        }
        if (!promises.length) {
            return MyPromise.reject(new utils_1.AggregateError(utils_1.allPromisesRejectedMessage));
        }
        var count = 0;
        return new MyPromise(function (resolve, reject) {
            promises.forEach(function (p) {
                MyPromise.resolve(p)
                    .then(function (result) { return resolve(result); })["catch"](function () {
                    count++;
                    if (count === promises.length) {
                        reject(new utils_1.AggregateError(utils_1.allPromisesRejectedMessage));
                    }
                });
            });
        });
    };
    MyPromise.allSettled = function (promises) {
        return new MyPromise(function (resolve, reject) {
            if (!Array.isArray(promises)) {
                return reject(new TypeError(utils_1.arrayRequeredMessage));
            }
            var result = [];
            var count = 0;
            promises.forEach(function (p, index) {
                MyPromise.resolve(p)
                    .then(function (value) {
                    result[index] = { status: Status.FULFILLED, value: value };
                }, function (reason) {
                    result[index] = { status: Status.REJECTED, reason: reason };
                })["finally"](function () {
                    count++;
                    if (count === promises.length) {
                        resolve(result);
                    }
                });
            });
        });
    };
    MyPromise.race = function (promises) {
        if (!Array.isArray(promises)) {
            return MyPromise.reject(new TypeError(utils_1.arrayRequeredMessage));
        }
        ;
        return new MyPromise(function (resolve, reject) {
            promises.forEach(function (p) {
                MyPromise.resolve(p).then(resolve)["catch"](reject);
            });
        });
    };
    MyPromise.resolve = function (value) {
        return new MyPromise(function (resolve) {
            resolve(value);
        });
    };
    MyPromise.reject = function (reason) {
        return new MyPromise(function (_, reject) {
            reject(reason);
        });
    };
    MyPromise.prototype.then = function (onResolve, onReject) {
        var _this = this;
        this.handled = true;
        return new MyPromise(function (resolve, reject) {
            _this.thenCbs.push([onResolve, onReject, resolve, reject]);
            _this.processNextTasks();
        });
    };
    ;
    MyPromise.prototype["catch"] = function (onReject) {
        return this.then(undefined, onReject);
    };
    ;
    MyPromise.prototype["finally"] = function (callback) {
        var call = function (result, failed) {
            if (failed === void 0) { failed = false; }
            return MyPromise.resolve(callback()).then(function () { return failed ? MyPromise.reject(result) : result; });
        };
        return this.then(function (value) { return call(value); }, function (reason) { return call(reason, true); });
    };
    MyPromise.prototype.processNextTasks = function () {
        var _this = this;
        if (this.status === Status.PENDING) {
            return;
        }
        // Условие на случай, если reject не обработан (отсутствуют колбэки, переданные в catch). В таком случае нативный промис выбросит необработанную ошибку. Повторяем это поведение.
        if (this.status === Status.REJECTED) {
            (0, utils_1.asap)(function () {
                if (!_this.handled) {
                    throw _this.error;
                }
            });
        }
        var thenCbs = this.thenCbs;
        this.thenCbs = [];
        (0, utils_1.asap)(function () {
            thenCbs.forEach(function (_a) {
                var thenCb = _a[0], catchCb = _a[1], resolve = _a[2], reject = _a[3];
                try {
                    if (_this.status === Status.FULFILLED) {
                        var value = thenCb ? thenCb(_this.value) : _this.value;
                        resolve(value);
                    }
                    else {
                        if (catchCb) {
                            var value = catchCb(_this.error);
                            resolve(value);
                        }
                        else {
                            reject(_this.error);
                        }
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    };
    ;
    return MyPromise;
}());
exports["default"] = MyPromise;
