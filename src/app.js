import { fixAll } from './repairs.js'
import fs from 'fs'
import colors from 'colors'


const path = `./src/rep/es-419_obs-tn/content/`


for (let index = 25; index <= 50; index++) {
    const dirname = path + index;

    fs.readdir(dirname, function(err, filenames) {
        
        if (err) {
        console.log(err)
        return;
        }

        console.log(dirname)
        
        filenames.forEach(function(filename) {

            //console.log(colors.green(filename))
            
            const filePath = dirname + '/' + filename

            fs.readFile(filePath, 'utf-8', function(err, content) {

                if (err) {
                    console.log('%c',err,)
                    return
                }
                
                fixAll(content).then( (fixed) => {
                    console.log('\n',colors.green(filePath),'\n')
                    console.log(fixed,'\n')

                });

            });

        });

        
    })
}


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


  