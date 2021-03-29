import { fixAll } from './repairs.js'
import fs from 'fs'

const path = `C:/Users/abelp/repos/es-419_obs-tn/content`

fs.readFile('./test.md', 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    let output = fixAll(data).then((text) => {console.log(text)})
    
  })    
