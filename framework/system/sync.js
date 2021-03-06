"use strict";
var _setImmediate2 = require("babel-runtime/core-js/set-immediate"),
    _setImmediate3 = _interopRequireDefault(_setImmediate2),
    _regenerator = require("babel-runtime/regenerator"),
    _regenerator2 = _interopRequireDefault(_regenerator),
    _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator"),
    _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        default: e
    }
}
var bignum = require("bignumber"),
    async = require("async"), ip = require("ip"), private_ = {}, self = null, library = null, modules = null;

function Sync(e, t) {
    library = t, e(null, self = this)
}
private_.createSandbox = function(e, t) {
    modules.blockchain.accounts.clone(function(n, r) {
        var o = {
            lastBlock: e,
            accounts: r.data,
            accountsIndexById: r.index,
            unconfirmedTransactions: [],
            unconfirmedTransactionsIdIndex: {},
            doubleSpendingTransactions: {}
        };
        t(null, o)
    })
}, private_.findUpdate = function(e, t, n) {
    // console.log("findUpdate lastBlock e: ", e);
    // console.log("findUpdate t: ", t);
    // console.log("findUpdate n: ", n);
    var r = this;
    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function o() {
        var a, i, c, s, u;
        return _regenerator2.default.wrap(function(r) {
            for (;;) switch (r.prev = r.next) {
                case 0:
                    //console.log("findUpdate case0: ");
                    return r.prev = 0, r.next = 3, modules.blockchain.blocks.getCommonBlock(e.height, t);
                case 3:
                    if (a = r.sent, app.logger.info("Get common block", a.height, a.id), a.height === e.height) {
                        r.next = 8;
                        break
                    }
                    //console.log('"---commonBlock", a, "---lastBlock", e), r.abrupt("return", n("Reject fork chain"): ', "---commonBlock", a, "---lastBlock", e), r.abrupt("return", n("Reject fork chain"));
                    return app.logger.debug("---commonBlock", a, "---lastBlock", e), r.abrupt("return", n("Reject fork chain"));
                case 8:
                    //console.log("findUpdate case8");
                    return r.next = 11, PIFY(modules.blockchain.blocks.loadBlocksPeer)(e.height, t);
                case 11:
                    return i = r.sent, app.logger.info("Loading " + i.length + " blocks"), r.next = 15, app.db.transaction();
                case 15:
                    //console.log("findUpdate case 15 r.sent: ", r.sent);
                    c = r.sent, r.prev = 16, r.t0 = _regenerator2.default.keys(i);
                case 18:
                    if ((r.t1 = r.t0()).done) {
                        r.next = 26;
                        break
                    }
                    s = r.t1.value;
                    // console.log("s: ", s);
                    // console.log("e.height: ", e.height);
                    if (!((u = i[s]).height > e.height)) {
                        r.next = 24;
                        break
                    }
                    // console.log("returning processBlock u: ", u);
                    return r.next = 24, modules.blockchain.blocks.processBlock(u, {
                        noTransaction: !0
                    });
                case 24:
                    r.next = 18;
                    break;
                case 26:
                    return r.next = 28, c.commit();
                case 28:
                    r.next = 35;
                    break;
                case 30:
                    return r.prev = 30, r.t2 = r.catch(16), r.next = 34, c.rollback();
                case 34:
                    throw r.t2;
                case 35:
                    if (!(i.length < 10)) {
                        r.next = 37;
                        break
                    }
                    return r.abrupt("break", 40);
                case 37:
                    e = modules.blockchain.blocks.getLastBlock(), r.next = 8;
                    break;
                case 40:
                    return app.logger.info("Sync blocks completed"), r.abrupt("return", n());
                case 44:
                    return r.prev = 44, r.t3 = r.catch(0), r.abrupt("return", n("Failed to sync blocks: " + r.t3));
                case 47:
                case "end":
                    return r.stop()
            }
        }, o, r, [
            [0, 44],
            [16, 30]
        ])
    }))()
}, private_.transactionsSync = function(e) {
    modules.api.transport.getRandomPeer("get", "/transactions/unconfirmed", {
        limit: 100
    }, function(t, n) {
        if (t || !n.body || !n.body.success) return e(t || n.body.error);
        if (!n.body.transactions || !n.body.transactions.length) return e();
        var r = n.body.transactions.filter(function(e) {
            return !modules.blockchain.transactions.hasUnconfirmed(e.id)
        });
        modules.blockchain.transactions.receiveTransactions(r, e)
    })
}, private_.blockSync = function(e) {
    // console.log("calling blockSync e:", e);
    modules.api.blocks.getHeight(function(t, n) {
        if (t) return e("Failed to get main block height: " + t);
        app.logger.info("get main block height", n);
        var r = modules.blockchain.blocks.getLastBlock();
        if (r.pointHeight && n - r.pointHeight <= 2) return e();
        modules.api.transport.getRandomPeer("get", "/blocks/height", null, function(t, n) {
            // console.log("modules.api.transport.getRandomPeer /blocks/height t: ", t);
            // console.log("modules.api.transport.getRandomPeer /blocks/height n: ", n);
            // console.log("bignum(r.height).gte(n.body.height): ", bignum(r.height).gte(n.body.height));
            return t ? 
                e("Failed to get blocks height: " + t) 
            : (app.logger.info("blockSync get block height", n), n.body && n.body.success ? 
                bignum(r.height).gte(n.body.height) ? 
                e() 
            : void private_.findUpdate(r, n.peer, e) : e("Failed to get blocks height: " + n.body))
        })
    })
}, private_.loadMultisignatures = function(e) {
    modules.blockchain.accounts.getExecutor(function(t, n) {
        if (t) return e(t);
        modules.api.multisignatures.pending(n.keypair.publicKey.toString("hex"), !0, function(t, r) {
            if (t) return e(t.toString());
            var o = [],
                a = r.transactions;
            async.eachSeries(a, function(e, t) {
                modules.api.multisignatures.sign(n.secret, null, e.transaction.id, function(e) {
                    e && o.push(e), (0, _setImmediate3.default)(t)
                })
            }, function() {
                if (o.length > 0) return e(o[0]);
                e()
            })
        })
    })
}, Sync.prototype.onBind = function(e) {
    modules = e
}, Sync.prototype.onBlockchainLoaded = function() {
    // console.log("onBlockchainLoaded");
    (0, _setImmediate3.default)(function e() {
        library.sequence.add(private_.blockSync, function(t) {
            t && app.logger.error("Sync#blockSync timer", t), setTimeout(e, 1e4)
        })
    }), (0, _setImmediate3.default)(function e() {
        library.sequence.add(private_.transactionsSync, function(t) {
            t && app.logger.error("Sync#transactionsSync timer", t), setTimeout(e, 1e4)
        })
    })
}, module.exports = Sync;
