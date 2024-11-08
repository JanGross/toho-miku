const QUALITY = {
    BAD : 1,
    OK : 2,
    GOOD : 3,
    GREAT : 4,
    EXCELLENT : 5,
    SHINY : 6
}

const QUALITY_NAMES = {
    1 : "Bad",
    2 : "Ok",
    3 : "Good",
    4 : "Great",
    5 : "Excellent",
    6 : "Shiny"
}

const QUALITY_SYMBOLS = {
    1 : "<a:shyyOrcaTrain:1059541149611733002><:shyyDead:1059541444110581780><:shyyDead:1059541444110581780><:shyyDead:1059541444110581780><:shyyDead:1059541444110581780>",
    2 : "<a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><:shyyDead:1059541444110581780><:shyyDead:1059541444110581780><:shyyDead:1059541444110581780>",
    3 : "<a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><:shyyDead:1059541444110581780><:shyyDead:1059541444110581780>",
    4 : "<a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><:shyyDead:1059541444110581780>",
    5 : "<a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002><a:shyyOrcaTrain:1059541149611733002>",
    6 : "⭐⭐⭐⭐⭐"
}

const CURRENCY_SYMBOLS = {
    1 : "🎶",
    2 : "💎"
}

const CURRENCY_NAMES = {
    1 : "Notes",
    2 : "Gems"
}

const QUALITY_VALUES = {
    1 : {
        type: 1,
        value: 2
    },
    2 : {
        type: 1,
        value: 5
    },
    3 : {
        type: 1,
        value: 10
    },
    4 : {
        type: 1,
        value: 15
    },
    5 : {
        type: 1,
        value: 20
    },
    6 : {
        type: 2,
        value: 2
    }
}

const BASE_VALUES = {
    wishlist_slots : 5
}

const DAILY_REWARDS = {
    primary_currency : 250,
    secondary_currency : 5,
    experience : 50
}

const PATREON = {
    roleServer : '441300798819794944',
    customsGID : 4,
    tiers : {
        1 : {
            modifiers: {
                drops: 0,
                claims: 1,
                wishlist: 5,
                currency: 1,
                daily: 1
            }
        },
        2 : {
            modifiers: {
                drops: 1,
                claims: 2,
                wishlist: 10,
                currency: 1,
                daily: 1.25
            }
        },
        3 : {
            modifiers: {
                drops: 2,
                claims: 6,
                wishlist: 15,
                currency: 1.25,
                daily: 1.5
            },
            custom_bg: true
        },
        4 : {
            modifiers: {
                drops: 2,
                claims: 8,
                wishlist: 25,
                currency: 1.75,
                daily: 2
            },
            custom_bg: true
        },
        5 : {
            modifiers: {
                drops: 4,
                claims: 14,
                wishlist: 45,
                currency: 2,
                daily: 4
            },
            custom_bg: true
        }
    }
}

exports.QUALITY = QUALITY;
exports.QUALITY_NAMES = QUALITY_NAMES;
exports.CURRENCY_SYMBOLS = CURRENCY_SYMBOLS;
exports.QUALITY_SYMBOLS = QUALITY_SYMBOLS;
exports.CURRENCY_NAMES = CURRENCY_NAMES;
exports.QUALITY_VALUES = QUALITY_VALUES;
exports.BASE_VALUES = BASE_VALUES;
exports.DAILY_REWARDS = DAILY_REWARDS;
exports.PATREON = PATREON;