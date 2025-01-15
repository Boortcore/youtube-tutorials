"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.arrayRequeredMessage = exports.allPromisesRejectedMessage = exports.AggregateError = exports.asap = exports.isPromiseLike = void 0;
function isPromiseLike(value) {
    return Boolean(value &&
        typeof value === "object" &&
        "then" in value &&
        typeof value.then === "function");
}
exports.isPromiseLike = isPromiseLike;
function createAsap() {
    if (typeof MutationObserver === "function") {
        return function asap(callback) {
            var observer = new MutationObserver(function () {
                callback();
                observer.disconnect();
            });
            var target = document.createElement("div");
            observer.observe(target, { attributes: true });
            target.setAttribute("data-foo", "");
        };
    }
    else if (typeof process === "object" &&
        typeof process.nextTick === "function") {
        return function asap(callback) {
            process.nextTick(callback);
        };
    }
    else if (typeof setImmediate === "function") {
        return function asap(callback) {
            setImmediate(callback);
        };
    }
    else {
        return function asap(callback) {
            setTimeout(callback, 0);
        };
    }
}
exports.asap = createAsap();
var AggregateError = /** @class */ (function (_super) {
    __extends(AggregateError, _super);
    function AggregateError(message) {
        return _super.call(this, message) || this;
    }
    return AggregateError;
}(Error));
exports.AggregateError = AggregateError;
var arrayRequeredMessage = 'The method of Promise accepts an array';
exports.arrayRequeredMessage = arrayRequeredMessage;
var allPromisesRejectedMessage = 'All promises were rejected';
exports.allPromisesRejectedMessage = allPromisesRejectedMessage;
