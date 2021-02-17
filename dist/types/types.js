"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalKey = exports.UpgradeType = exports.FinanceGeneralType = exports.FinanceType = exports.EventLogLevel = exports.PlayerType = exports.PlayerLevel = void 0;
var PlayerLevel;
(function (PlayerLevel) {
    PlayerLevel[PlayerLevel["None"] = 0] = "None";
    PlayerLevel[PlayerLevel["Novice"] = 1] = "Novice";
    PlayerLevel[PlayerLevel["Intermediate"] = 2] = "Intermediate";
    PlayerLevel[PlayerLevel["Advanced"] = 3] = "Advanced";
    PlayerLevel[PlayerLevel["Master"] = 4] = "Master";
})(PlayerLevel = exports.PlayerLevel || (exports.PlayerLevel = {}));
var PlayerType;
(function (PlayerType) {
    PlayerType[PlayerType["Human"] = 0] = "Human";
    PlayerType[PlayerType["Computer"] = 1] = "Computer";
})(PlayerType = exports.PlayerType || (exports.PlayerType = {}));
var EventLogLevel;
(function (EventLogLevel) {
    EventLogLevel[EventLogLevel["GAME"] = 0] = "GAME";
    EventLogLevel[EventLogLevel["DEBUG"] = 1] = "DEBUG";
    EventLogLevel[EventLogLevel["WARNING"] = 2] = "WARNING";
    EventLogLevel[EventLogLevel["ERROR"] = 3] = "ERROR";
})(EventLogLevel = exports.EventLogLevel || (exports.EventLogLevel = {}));
var FinanceType;
(function (FinanceType) {
    FinanceType[FinanceType["Resource"] = 0] = "Resource";
    FinanceType[FinanceType["Track"] = 1] = "Track";
    FinanceType[FinanceType["Upkeep"] = 2] = "Upkeep";
    FinanceType[FinanceType["Upgrade"] = 3] = "Upgrade";
    FinanceType[FinanceType["Train"] = 4] = "Train";
    FinanceType[FinanceType["Recoup"] = 5] = "Recoup";
    FinanceType[FinanceType["StockBuy"] = 6] = "StockBuy";
    FinanceType[FinanceType["StockSell"] = 7] = "StockSell";
})(FinanceType = exports.FinanceType || (exports.FinanceType = {}));
var FinanceGeneralType;
(function (FinanceGeneralType) {
    FinanceGeneralType[FinanceGeneralType["Income"] = 0] = "Income";
    FinanceGeneralType[FinanceGeneralType["Expense"] = 1] = "Expense";
})(FinanceGeneralType = exports.FinanceGeneralType || (exports.FinanceGeneralType = {}));
var UpgradeType;
(function (UpgradeType) {
    UpgradeType[UpgradeType["TrainValueCheaper"] = 0] = "TrainValueCheaper";
    UpgradeType[UpgradeType["TrainUpkeepCheaper"] = 1] = "TrainUpkeepCheaper";
    UpgradeType[UpgradeType["TrainSpeedQuicker"] = 2] = "TrainSpeedQuicker";
    UpgradeType[UpgradeType["TrackValueCheaper"] = 3] = "TrackValueCheaper";
    UpgradeType[UpgradeType["TurnCostCheaper"] = 4] = "TurnCostCheaper";
})(UpgradeType = exports.UpgradeType || (exports.UpgradeType = {}));
var LocalKey;
(function (LocalKey) {
    LocalKey[LocalKey["Trains"] = 0] = "Trains";
    LocalKey[LocalKey["Upgrades"] = 1] = "Upgrades";
    LocalKey[LocalKey["Resources"] = 2] = "Resources";
    LocalKey[LocalKey["Cities"] = 3] = "Cities";
    LocalKey[LocalKey["Players"] = 4] = "Players";
    LocalKey[LocalKey["CurrentPlayer"] = 5] = "CurrentPlayer";
    LocalKey[LocalKey["Turn"] = 6] = "Turn";
    LocalKey[LocalKey["Stocks"] = 7] = "Stocks";
    LocalKey[LocalKey["HasActiveGame"] = 8] = "HasActiveGame";
})(LocalKey = exports.LocalKey || (exports.LocalKey = {}));
;
;
