"use strict";
var _regenerator = require("babel-runtime/regenerator"),
    _regenerator2 = _interopRequireDefault(_regenerator),
    _slicedToArray2 = require("babel-runtime/helpers/slicedToArray"),
    _slicedToArray3 = _interopRequireDefault(_slicedToArray2),
    _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator"),
    _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        default: e
    }
}
var assert = require("assert"),
    extend = require("extend"),
    bignum = require("bignumber"),
    ByteBuffer = require("bytebuffer"),
    slots = require("../helpers/slots.js"),
    helpers = require("../helpers"),
    private_ = {},
    self = null,
    library = null,
    modules = null;

function Transaction(e, r) {
    library = r, e(null, self = this)
}
Transaction.prototype.create = function(e, r, t) {
    var n = {
        fee: e.fee,
        senderPublicKey: r.publicKey.toString("hex"),
        senderId: modules.blockchain.accounts.generateAddressByPublicKey(r.publicKey),
        timestamp: slots.getTime(),
        type: e.type,
        args: e.args
    };
    return n.signature = modules.api.crypto.sign(r, this.getBytes(n)), n.id = this.getId(n), n
}, Transaction.prototype.getId = function(e) {
    return modules.api.crypto.getId(this.getBytes(e))
}, Transaction.prototype.getBytes = function(e, r) {
    try {
        var t = new ByteBuffer(1, !0);
        t.writeInt(e.timestamp), t.writeString(e.fee);
        for (var n = new Buffer(e.senderPublicKey, "hex"), a = 0; a < n.length; a++) t.writeByte(n[a]);
        if (t.writeInt(e.type), e.args && t.writeString(e.args), !r && e.signature) {
            var i = new Buffer(e.signature, "hex");
            for (a = 0; a < i.length; a++) t.writeByte(i[a])
        }
        t.flip()
    } catch (r) {
        throw app.logger.debug("Failed to get transaction bytes", r, e), Error(r.toString())
    }
    return t.toBuffer()
}, Transaction.prototype.verifyBytes = function(e, r, t) {
    return modules.api.crypto.verify(e, r, t)
}, Transaction.prototype.verifySignature = function(e, r, t) {
    if (!t) return !1;
    try {
        var n = self.getBytes(e, !0),
            a = modules.api.crypto.verify(r, t, n)
    } catch (e) {
        throw Error(e.toString())
    }
    return a
}, Transaction.prototype.verify = function(e) {
    if (e.timestamp > slots.getNow()) throw new Error("Invalid timestamp");
    if (!e.type) throw new Error("Invalid function");
    try {
        var r = self.verifySignature(e, e.senderPublicKey, e.signature)
    } catch (e) {
        throw new Error("verify signature exception: " + e)
    }
    return r
}, Transaction.prototype.apply = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(r, t) {
        var n, a, i, o, s, u, p, c, l;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    if (1 === t.height) {
                        e.next = 8;
                        break
                    }
                    if (n = app.getFee(r.type) || app.defaultFee, !bignum(r.fee).lt(n.min)) {
                        e.next = 4;
                        break
                    }
                    throw new Error("Invalid transaction fee");
                case 4:
                    if (!app.balances.get(r.senderId, n.currency).lt(r.fee)) {
                        e.next = 7;
                        break
                    }
                    throw new Error("Insufficient balance");
                case 7:
                    app.balances.decrease(r.senderId, n.currency, r.fee);
                case 8:
                    if (a = app.getContractName(r.type)) {
                        e.next = 11;
                        break
                    }
                    throw new Error("Unsupported transaction type");
                case 11:
                    if (i = a.split("."), o = (0, _slicedToArray3.default)(i, 2), s = o[0], u = o[1], s && u) {
                        e.next = 14;
                        break
                    }
                    throw new Error("Invalid transaction function");
                case 14:
                    if (p = app.contract[s][u]) {
                        e.next = 17;
                        break
                    }
                    throw new Error("Contract not found");
                case 17:
                    return c = {
                        trs: r,
                        block: t
                    }, app.sdb.beginTransaction(), e.next = 21, p.apply(c, JSON.parse(r.args));
                case 21:
                    if (!(l = e.sent)) {
                        e.next = 24;
                        break
                    }
                    throw new Error(l);
                case 24:
                    app.sdb.commitTransaction();
                case 25:
                case "end":
                    return e.stop()
            }
        }, e, this)
    }));
    return function(r, t) {
        return e.apply(this, arguments)
    }
}(), Transaction.prototype.normalize = function(e) {
    for (var r in e) null !== e[r] && void 0 !== e[r] || delete e[r];
    if (!library.validator.validate(e, {
            type: "object",
            properties: {
                id: {
                    type: "string"
                },
                timestamp: {
                    type: "integer"
                },
                senderId: {
                    type: "string"
                },
                senderPublicKey: {
                    type: "string",
                    format: "publicKey"
                },
                fee: {
                    type: "string"
                },
                signature: {
                    type: "string",
                    format: "signature"
                },
                type: {
                    type: "integer"
                },
                args: {
                    type: "string"
                }
            },
            required: ["timestamp", "senderPublicKey", "fee", "signature", "type", "args"]
        })) throw new Error(library.validator.getLastError().details[0].message)
}, Transaction.prototype.onBind = function(e) {
    modules = e
}, module.exports = Transaction;
