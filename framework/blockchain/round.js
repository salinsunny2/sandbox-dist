"use strict";
var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray"),
    _slicedToArray3 = _interopRequireDefault(_slicedToArray2),
    _getIterator2 = require("babel-runtime/core-js/get-iterator"),
    _getIterator3 = _interopRequireDefault(_getIterator2),
    _stringify = require("babel-runtime/core-js/json/stringify"),
    _stringify2 = _interopRequireDefault(_stringify),
    _regenerator = require("babel-runtime/regenerator"),
    _regenerator2 = _interopRequireDefault(_regenerator),
    _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator"),
    _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2),
    _setImmediate2 = require("babel-runtime/core-js/set-immediate"),
    _setImmediate3 = _interopRequireDefault(_setImmediate2);

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        default: e
    }
}
var async = require("async"), crypto = require("crypto"), BelriumJS = require("asch-js"), slots = require("../helpers/slots.js"), OutTransferManager = require("../helpers/outtransfer-manager.js"), private_ = {}, self = null, library = null, modules = null;

function Round(e, t) {
    library = t, e(null, self = this)
}
private_.loaded = !1, private_.delegates = [], private_.cacheDelegates = {
    height: 0,
    delegates: []
}, private_.keypairs = {}, private_.outTransferManager = null, private_.signTransaction = function(e, t) {
    return modules.logic.transaction.create(t, e.keypair)
}, private_.loop = function(e, t) {
    if (!private_.loaded) return app.logger.debug("Loop exit: syncing"), (0, _setImmediate3.default)(t);
    var r = slots.getSlotNumber(),
        a = modules.blockchain.blocks.getLastBlock();
    if (r == slots.getSlotNumber(a.timestamp)) return (0, _setImmediate3.default)(t);
    var n = private_.getState(a.height + 1);
    if (null === n) return app.logger.info("Loop exit: skipping slot"), (0, _setImmediate3.default)(t);
    library.sequence.add(function(t) {
        (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function r() {
            var a, s, i;
            return _regenerator2.default.wrap(function(r) {
                for (;;) switch (r.prev = r.next) {
                    case 0:
                        if (r.prev = 0, a = slots.getSlotNumber(n.slotTime), s = slots.getSlotNumber(), a !== s) {
                            r.next = 15;
                            break
                        }
                        return r.next = 6, private_.balanceSync(n.keypair);
                    case 6:
                        return r.next = 8, private_.withdrawalSync(n.secret);
                    case 8:
                        if (!app.hooks.beforeCreateBlock) {
                            r.next = 11;
                            break
                        }
                        return r.next = 11, app.hooks.beforeCreateBlock({
                            height: modules.blockchain.blocks.getLastBlock().height + 1,
                            pointId: e.id,
                            pointHeight: e.height,
                            slotTime: n.slotTime,
                            signTransaction: private_.signTransaction.bind(null, n),
                            addTransactions: modules.blockchain.transactions.receiveTransactionsAsync
                        });
                    case 11:
                        return r.next = 13, modules.blockchain.blocks.createBlock(n.keypair, n.slotTime, e);
                    case 13:
                        i = modules.blockchain.blocks.getLastBlock(), app.logger.info("New dapp block id: " + i.id + " height: " + i.height + " via point: " + i.pointHeight);
                    case 15:
                        r.next = 20;
                        break;
                    case 17:
                        r.prev = 17, r.t0 = r.catch(0), app.logger.error("Failed to create new block: ", r.t0);
                    case 20:
                        modules.blockchain.transactions.clearUnconfirmed(), t();
                    case 22:
                    case "end":
                        return r.stop()
                }
            }, r, this, [
                [0, 17]
            ])
        }))()
    }, t)
}, private_.balanceSync = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t) {
        var r, a, n, s, i, o, l, u, c, p, d;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    return app.logger.trace("enter balanceSync ------------------------"), e.next = 3, app.model.Transaction.findAll({
                        condition: {
                            type: 1
                        },
                        fields: ["args"],
                        sort: {
                            height: -1
                        },
                        limit: 1
                    });
                case 3:
                    return r = e.sent, app.logger.debug("balanceSync found deposit transactions:", r), a = null, r && r.length && (a = JSON.parse(r[0].args)[2]), e.next = 9, PIFY(modules.api.dapps.getBalanceTransactions)(a);
                case 9:
                    if ((n = e.sent) && n.length) {
                        e.next = 12;
                        break
                    }
                    return e.abrupt("return");
                case 12:
                    app.logger.debug("balanceSync mainTransactions:", n), s = [], i = !0, o = !1, l = void 0, e.prev = 17, u = (0, _getIterator3.default)(n);
                case 19:
                    if (i = (c = u.next()).done) {
                        e.next = 28;
                        break
                    }
                    return p = c.value, e.next = 23, app.model.Deposit.exists({
                        srcId: p.id
                    });
                case 23:
                    e.sent || s.push(p);
                case 25:
                    i = !0, e.next = 19;
                    break;
                case 28:
                    e.next = 34;
                    break;
                case 30:
                    e.prev = 30, e.t0 = e.catch(17), o = !0, l = e.t0;
                case 34:
                    e.prev = 34, e.prev = 35, !i && u.return && u.return();
                case 37:
                    if (e.prev = 37, !o) {
                        e.next = 40;
                        break
                    }
                    throw l;
                case 40:
                    return e.finish(37);
                case 41:
                    return e.finish(34);
                case 42:
                    return d = s.map(function(e) {
                        return modules.logic.transaction.create({
                            type: 1,
                            fee: "0",
                            args: (0, _stringify2.default)([e.currency, "BEL" === e.currency ? e.amount : e.amount2, e.id, modules.blockchain.accounts.generateAddressByPublicKey(e.senderPublicKey)])
                        }, t)
                    }), e.next = 45, modules.blockchain.transactions.receiveTransactionsAsync(d);
                case 45:
                case "end":
                    return e.stop()
            }
        }, e, this, [
            [17, 30, 34, 42],
            [35, , 37, 41]
        ])
    }));
    return function(t) {
        return e.apply(this, arguments)
    }
}(), private_.withdrawalSync = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t) {
        var r, a, n, s, i, o, l, u, c, p, d, g, f, h, v, m, y, _, b, k;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    for (r = private_.outTransferManager.getPending(), a = !0, n = !1, s = void 0, e.prev = 4, i = (0, _getIterator3.default)(r); !(a = (o = i.next()).done); a = !0)(l = o.value).signatures.length >= app.meta.unlockDelegates && (modules.api.dapps.submitOutTransfer(l), private_.outTransferManager.setReady(l.id));
                    e.next = 12;
                    break;
                case 8:
                    e.prev = 8, e.t0 = e.catch(4), n = !0, s = e.t0;
                case 12:
                    e.prev = 12, e.prev = 13, !a && i.return && i.return();
                case 15:
                    if (e.prev = 15, !n) {
                        e.next = 18;
                        break
                    }
                    throw s;
                case 18:
                    return e.finish(15);
                case 19:
                    return e.finish(12);
                case 20:
                    return e.next = 22, PIFY(modules.api.dapps.getWithdrawalLastTransaction)();
                case 22:
                    if (u = e.sent, app.logger.debug("get last withdrawal id", u), c = 0, !u.id) {
                        e.next = 31;
                        break
                    }
                    return e.next = 28, app.model.Transaction.findOne({
                        condition: {
                            id: u.id
                        },
                        fields: ["height", "type"]
                    });
                case 28:
                    p = e.sent, app.logger.debug("found last inner withdrawal", p), p ? c = p.height : app.logger.warn("WARNING last inner withdrawal not found", u.id);
                case 31:
                    return e.next = 33, app.model.Transaction.findAll({
                        condition: {
                            type: 2,
                            height: {
                                $gt: c
                            }
                        },
                        fields: ["id", "senderPublicKey", "height", "args"],
                        sort: {
                            height: 1
                        }
                    });
                case 33:
                    for (d = e.sent, app.logger.debug("found inner withdrawal transactions", d), g = d.filter(function(e) {
                            return !private_.outTransferManager.has(e.id)
                        }).map(function(e) {
                            var r = JSON.parse(e.args),
                                a = (0, _slicedToArray3.default)(r, 2),
                                n = a[0],
                                s = a[1],
                                i = modules.blockchain.accounts.generateAddressByPublicKey(e.senderPublicKey),
                                o = BelriumJS.transfer.createOutTransfer(i, app.meta.transactionId, e.id, n, s, t);
                            o.signatures = [];
                            var l = !0,
                                u = !1,
                                c = void 0;
                            try {
                                for (var p, d = (0, _getIterator3.default)(app.config.secrets); !(l = (p = d.next()).done); l = !0) {
                                    var g = p.value;
                                    if (g !== t && o.signatures.push(BelriumJS.transfer.signOutTransfer(o, g)), o.signatures.length >= app.meta.unlockDelegates) break
                                }
                            } catch (e) {
                                u = !0, c = e
                            } finally {
                                try {
                                    !l && d.return && d.return()
                                } finally {
                                    if (u) throw c
                                }
                            }
                            return {
                                innerId: e.id,
                                ot: o
                            }
                        }), f = !0, h = !1, v = void 0, e.prev = 39, m = (0, _getIterator3.default)(g); !(f = (y = m.next()).done); f = !0) _ = y.value, b = _.ot, k = _.innerId, b.signatures.length >= app.meta.unlockDelegates ? (modules.api.dapps.submitOutTransfer(b), private_.outTransferManager.addReady(b, k)) : (modules.api.transport.message("pendingOutTransfer", b), private_.outTransferManager.addPending(b, k));
                    e.next = 47;
                    break;
                case 43:
                    e.prev = 43, e.t1 = e.catch(39), h = !0, v = e.t1;
                case 47:
                    e.prev = 47, e.prev = 48, !f && m.return && m.return();
                case 50:
                    if (e.prev = 50, !h) {
                        e.next = 53;
                        break
                    }
                    throw v;
                case 53:
                    return e.finish(50);
                case 54:
                    return e.finish(47);
                case 55:
                    private_.outTransferManager.clear();
                case 56:
                case "end":
                    return e.stop()
            }
        }, e, this, [
            [4, 8, 12, 20],
            [13, , 15, 19],
            [39, 43, 47, 55],
            [48, , 50, 54]
        ])
    }));
    return function(t) {
        return e.apply(this, arguments)
    }
}(), private_.getState = function(e) {
    var t = self.generateDelegateList(e),
        r = slots.getSlotNumber(),
        a = t[r % t.length];
    return a && private_.keypairs[a] ? {
        slotTime: slots.getSlotTime(r),
        address: a,
        keypair: private_.keypairs[a].keypair,
        secret: private_.keypairs[a].secret
    } : null
}, Round.prototype.validateProposeSlot = function(e) {
    var t = self.generateDelegateList(e.height);
    return t[slots.getSlotNumber(e.timestamp) % t.length] === modules.blockchain.accounts.generateAddressByPublicKey(e.generatorPublicKey)
}, Round.prototype.getCurrentDelegate = function(e) {
    var t = self.generateDelegateList(e);
    return t[slots.getSlotNumber() % t.length]
}, Round.prototype.calc = function(e) {
    return Math.floor(e / private_.delegates.length) + (e % private_.delegates.length > 0 ? 1 : 0)
}, Round.prototype.getActiveKeypairs = function() {
    var e = [];
    for (var t in private_.keypairs) e.push(private_.keypairs[t].keypair);
    return e
}, Round.prototype.generateDelegateList = function(e) {
    if (private_.cacheDelegates.height === e) return private_.cacheDelegates.delegates;
    for (var t = self.calc(e).toString(), r = private_.delegates.slice(0), a = crypto.createHash("sha256").update(t, "utf8").digest(), n = 0, s = r.length; n < s; n++) {
        for (var i = 0; i < 4 && n < s; n++, i++) {
            var o = a[i] % s,
                l = r[o];
            r[o] = r[n], r[n] = l
        }
        a = crypto.createHash("sha256").update(a).digest()
    }
    return private_.cacheDelegates = {
        height: e,
        delegates: r
    }, r
}, Round.prototype.getDelegatePublicKeys = function() {
    return app.meta.delegates
}, Round.prototype.isDelegateAddress = function(e) {
    return -1 !== private_.delegates.indexOf(e)
}, Round.prototype.onBind = function(e) {
    for (var t in modules = e, app.config.secrets) {
        var r = modules.api.crypto.keypair(app.config.secrets[t]),
            a = modules.blockchain.accounts.generateAddressByPublicKey(r.publicKey);
        app.logger.info("Forging enable on account: " + a), private_.keypairs[a] = {
            keypair: r,
            secret: app.config.secrets[t]
        }
    }
}, Round.prototype.onBlockchainLoaded = function() {
    private_.loaded = !0, private_.delegates = [];
    for (var e = 0; e < app.meta.delegates.length; e++) private_.delegates.push(modules.blockchain.accounts.generateAddressByPublicKey(app.meta.delegates[e])), private_.delegates.sort();
    slots.setDelegatesNumber(app.meta.delegates.length), private_.outTransferManager = new OutTransferManager(app.meta.unlockDelegates)
}, Round.prototype.onMessage = function(e) {
    if (private_.loaded)
        if ("point" == e.topic) {
            var t = e.message;
            private_.loop(t, function(e) {
                e && app.logger.error("Loop error", e)
            })
        } else if ("pendingOutTransfer" == e.topic) {
        var r = e.message;
        if (!private_.outTransferManager.has(r)) {
            var a = BelriumJS.transfer.signOutTransfer(out);
            private_.outTransferManager.addPending(r), private_.outTransferManager.addSignature(r.id, a), modules.api.transport.message("otSignature", {
                id: r.id,
                signature: a
            })
        }
    } else if ("otSignature" == e.topic) {
        var n = e.message.id,
            s = e.message.signature;
        private_.outTransferManager.addSignature(n, s)
    } else if ("withdrawalCompleted" == e.topic) {
        var i = e.message.transactionId;
        private_.outTransferManager.setReady(i)
    }
}, module.exports = Round;
