"use strict";
var self = null,
    library = null,
    modules = null;

function Blocks(e, o) {
    library = o, e(null, self = this)
}
Blocks.prototype.getBlock = function(e, o) {
    var l = {
        call: "blocks#getBlock",
        args: {
            id: e
        }
    };
    library.sandbox.sendMessage(l, o)
}, Blocks.prototype.getBlocks = function(e, o) {
    var l = {
        call: "blocks#getBlocks",
        args: {
            limit: e.limit,
            orderBy: e.orderBy,
            offset: e.offset,
            generatorPublicKey: e.generatorPublicKey,
            totalAmount: e.totalAmount,
            totalFee: e.totalFee,
            previousBlock: e.previousBlock,
            height: e.height
        }
    };
    library.sandbox.sendMessage(l, o)
}, Blocks.prototype.getHeight = function(e) {
    library.sandbox.sendMessage({
        call: "blocks#getHeight",
        args: {}
    }, e)
}, Blocks.prototype.getFee = function(e) {
    library.sandbox.sendMessage({
        call: "blocks#getFee",
        args: {}
    }, e)
}, Blocks.prototype.onBind = function(e) {
    modules = e
}, module.exports = Blocks;
