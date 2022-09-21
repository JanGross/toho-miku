const { QUALITY, QUALITY_NAMES } = require('./config/constants');
let results = [];
let drops = 1000;
let header = `⫭=== Quality distribution for ${drops.toLocaleString()} drops: ===⫬`;
console.log(header);
console.log(`|${' '.repeat(header.length-2)}|`);
for ( let  i =  0 ; i <  drops ; i++) {
    //generate rarity based on drop rate
    let quality = undefined;
    let roll = Math.random() * 100;
    if (roll <= 45.0) {
        quality = QUALITY.BAD;
    }
    if (roll > 45.0) {
        quality = QUALITY.OK;
    }
    if (roll > 70.0) {
        quality = QUALITY.GOOD;
    }
    if (roll > 85.0) {
        quality = QUALITY.GREAT;
    }
    if (roll > 95.0) {
     quality = QUALITY.EXCELLENT;
    }
    if (roll > 99.9) {
        quality = QUALITY.SHINY;
    }
    results.push(quality);
}

//count the number of times each quality appears
let counts = {};
results.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
//print results with percentages
let p_total = 0;
for (let key in counts) {
    let p = counts[key]/results.length * 100;
    p_total += p;
    let cpStr = `${counts[key].toLocaleString()} (${p}%)`;
    let fStr = `| ${key}/${QUALITY_NAMES[key]}${' '.repeat(10-QUALITY_NAMES[key].length)}: ${cpStr}`;
    console.log(`${fStr}${' '.repeat(header.length-fStr.length-1)}|`);
}
console.log(`⌊${'_'.repeat(header.length-2)}⌋`);

