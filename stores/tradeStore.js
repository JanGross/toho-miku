module.exports = {
    name: "TradeStore",
    activeTrades: [],

    async addTrade(trade) {
        this.activeTrades.push(trade);
    },

    async removeTrade(trade) {
        this.activeTrades.splice(this.activeTrades.indexOf(trade), 1);
    },

    async getTradeById(tradeId) {
        return this.activeTrades.find(trade => trade.id === tradeId);
    },

    async getTradeByUser(userId) {
        return this.activeTrades.find(trade => trade.user1.id === userId || trade.user2.id === userId);
    },

    Trade: class Trade {
        constructor(id, user1, user2) {
            this.id = id;
            this.user1 = user1;
            this.user2 = user2;
            this.embed = null;
            this.user1Cards = [];
            this.user2Cards = [];
            this.user1Accept = false;
            this.user2Accept = false;
        }
    }
}