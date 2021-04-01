import { fixAll } from './repairs.js'
import fs from 'fs'
import colors from 'colors'

const repPath = `./src/rep/`

const path = repPath + `es-419_obs-tn/content/`

async function fixFiles(path){

    let dirname = path

    fs.readdir(dirname, function(err, filenames) {
        
        if (err) {
            console.log(err)
            return;
        }

        
        
        filenames.forEach(function(filename) {

            //console.log(colors.green(filename))
            
            const filePath = dirname + '/' + filename

            let stats = fs.statSync(path)

            if(stats.isDirectory())

            fs.readFile(filePath, 'utf-8', function(err, content) {

                if (err) {
                    console.error(err)
                    return
                }
                
                fixAll(content).then( (fixed) => {

                    fs.writeFile(filePath, fixed.fixed, 'utf-8', function(err, content) {

                        if (err) {
                            console.error(err)
                            return
                        }
                    })

                    if(fixed.warnings){ 

                        let today = new Date();

                        let date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

                        let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

                        let dateTime = date+' '+time;

                        let warnings = `(${index}/${filename}) ${dateTime} | ${filePath} \n [WARNINGS] \n ${fixed.warnings} \n\n`

                        fs.appendFile('./src/logs/log.txt', warnings, 'utf-8', function(err, content) {

                            if (err) {
                                console.error(err)
                                return
                            }
                        })

                        //console.log(`\n`,colors.green(filePath),`\n`)
                        //console.log(colors.yellow(date,'[Warnings] \n',fixed.warnings, '\n'))
                    }
                });

            });

        })

        
    })
    

}

/* async function fixFiles(path){

    for (let index = 25; index <= 50; index++) {
        const dirname = path + index;

        fs.readdir(dirname, function(err, filenames) {
            
            if (err) {
            console.log(err)
            return;
            }

            //console.log(dirname)
            
            filenames.forEach(function(filename) {

                //console.log(colors.green(filename))
                
                const filePath = dirname + '/' + filename

                fs.readFile(filePath, 'utf-8', function(err, content) {

                    if (err) {
                        console.error(err)
                        return
                    }
                    
                    fixAll(content).then( (fixed) => {

                        fs.writeFile(filePath, fixed.fixed, 'utf-8', function(err, content) {

                            if (err) {
                                console.error(err)
                                return
                            }
                        })

                        if(fixed.warnings){ 

                            let today = new Date();

                            let date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

                            let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

                            let dateTime = date+' '+time;

                            let warnings = `(${index}/${filename}) ${dateTime} | ${filePath} \n [WARNINGS] \n ${fixed.warnings} \n\n`

                            fs.appendFile('./src/logs/log.txt', warnings, 'utf-8', function(err, content) {

                                if (err) {
                                    console.error(err)
                                    return
                                }
                            })

                            //console.log(`\n`,colors.green(filePath),`\n`)
                            //console.log(colors.yellow(date,'[Warnings] \n',fixed.warnings, '\n'))
                        }
                    });

                });

            })

            
        })
    }

} */

fixFiles(path)

// var fs = require('fs');

// function readFiles(dirname, onFileContent, onError) {
//   fs.readdir(dirname, function(err, filenames) {
//     if (err) {
//       onError(err);
//       return;
//     }
//     filenames.forEach(function(filename) {
//       fs.readFile(dirname + filename, 'utf-8', function(err, content) {
//         if (err) {
//           onError(err);
//           return;
//         }
//         onFileContent(filename, content);
//       });
//     });
//   });
// }


  