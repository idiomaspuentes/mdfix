import fs from 'fs'
import { fixFile } from './fixFile.js'

const repPath = `./src/rep/`

const filePath = repPath + `es-419_tw/bible/`

let fixFiles = filePath => {

    let dirname = filePath

    fs.readdir(dirname, function(err, filenames) {
        
        if (err) {
            console.log(err)
            return;
        }

        filenames.forEach(function(filename) {
            
            const dirPath = dirname + '/' + filename
            let stats = fs.statSync(dirPath)

            if(stats.isDirectory())
                fixFiles(dirPath)
            else            
                fixFile(dirPath)

        })        
    })    
}

fixFiles(filePath)