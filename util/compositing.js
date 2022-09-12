const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const { Card } = require('../models');

//TODO: Handle missing images
module.exports = {
    name: "Compositing",
    renderProfile: async function(profile, svgTemplate, renderedCards) {
        let hash = crypto.createHash('md5').update(JSON.stringify(profile) + svgTemplate).digest('hex');

        let outFile = `/app/assets/image_cache/profiles/${hash}.gif`;
        console.log('Rendering profile to ' + outFile);

        //composite {overlay} {background} [{mask}] [-compose {method}]   {result}
        let args =  ['svg:-', 'null:',
                        '\(', `${renderedCards[0]}`, '-coalesce', '\)',
                        '-geometry', '+25+85', '-compose', 'over', '-layers', 'composite', 
                        'null:', '\(', `${renderedCards[1]}`, '-coalesce', '-resize', '170x283', '\)',
                        '-geometry', '+350+300', '-compose', 'over', '-layers', 'composite',
                        'null:', '\(', `${renderedCards[2]}`, '-coalesce', '-resize', '170x283', '\)',
                        '-geometry', '+535+300', '-compose', 'over', '-layers', 'composite',
                        'null:', '\(', `${renderedCards[3]}`, '-coalesce', '-resize', '170x283', '\)',
                        '-geometry', '+720+300', '-compose', 'over', '-layers', 'composite',
                        '-layers', 'optimize', outFile];

        console.log('GM Args: ' + args);

        const composite = spawn('convert', args);
        composite.stdin.write(svgTemplate);
        composite.stdin.end();
        
        composite.stderr.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        const exitCode = await new Promise( (resolve, reject) => {
            composite.on('close', resolve);
        })
        
        return outFile;
    }
}
