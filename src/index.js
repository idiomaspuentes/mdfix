import marked from 'marked';
import M from 'materialize-css';
import './style.css';

let newButton = document.getElementById('new-button')
    newButton.addEventListener('click', function () { newRepair(); })

let toggleButton = document.getElementById('toggle-button')
    toggleButton.addEventListener('click', function () { toggleView(toggleButton); })

let entradaBox = document.getElementById('entrada')
    entradaBox.addEventListener('keyup', function () { fixAll(entradaBox.value); })

function newRepair(){

    let button = document.getElementById('toggle-button')
    
    if(button.getAttribute('data-toggle') == 'code') toggleView(button);

    let resPreview = document.getElementById('result-preview')
    let srcPreview = document.getElementById('source-preview')
    resPreview.innerHTML = ''
    srcPreview.innerHTML = ''

    let salida = document.getElementById('salida')
    let entrada = document.getElementById('entrada')
    entrada.value = ''
    M.textareaAutoResize(entrada)
    salida.value = ''
    M.textareaAutoResize(salida)
    entrada.focus()
    M.updateTextFields()
}

function toggleView(button){
    if(button.getAttribute('data-toggle') == 'preview')
    {   
        button.innerHTML = '<i class="material-icons left">code</i>Ver código'
        button.setAttribute('data-toggle', 'code')
    }
    else
    {
        button.innerHTML = '<i class="material-icons left">visibility</i>Previsualizar'
        button.setAttribute('data-toggle', 'preview')
    }

    let code = document.querySelectorAll(".code")
        code.forEach((element)=>{
            element.classList.toggle("active")
        })

    let preview = document.querySelectorAll(".preview")
        preview.forEach((element)=>{
            element.classList.toggle("active")
        })            
}

function showResults(input, output){
    let salida = document.getElementById('salida')
    let resPreview = document.getElementById('result-preview')
    let srcPreview = document.getElementById('source-preview')
    salida.value = output  
    M.updateTextFields()
    M.textareaAutoResize(salida)
    salida.select();
    document.execCommand('copy')
    M.toast({html: 'Reultado Copiado'})
    srcPreview.innerHTML = marked(input)
    resPreview.innerHTML = marked(output)
}

async function fixAll(target){         

    let cleanObs = document.getElementById('limpiar-obs').checked
    let refactorLists = document.getElementById('listas').checked
 

    let fixed = await cleanTrashCharacters(target)
        // .then( response => { if(cleanObs) return cleanOBS(response) })
        // .then( response => { if(refactorLists) return refactorList(response) })
        .then( response => fixLinks(response) )
        .then( response => cleanDoubleSpaces(response) )
        .then( response => formatSeeMore(response) )  
        .then( response => fixLists(response) ) 
        .then( response => fixSpaceBeforeLineFeed(response) )
        .then( response => addPunctuationSpace(response) )
        .then( response => fixQuotes(response) )
        //.then( response => fixTranslationWords(response) )
        .then( response => fixTitles(response) )         
        .then( response => fixStarEnclosures(response) )
        .then( response => fixUnderScoreEnclosures(response) )
        .then( response => cleanEndSpaces(response) )
        .then( response => fixVersesSpaces(response) )
        .then( response => cleanEdges(response) )
        //.then( response => unSubTitle(response) )
        
    showResults(target,fixed);
}


// REPAIR FUNCTIONS

async function cleanLinks(target) {
    
    let pattern = /(?:rc:|https?:|\.+\/)(?:[\w \/._-]+)\/ *[\w-_.]+/gm;
    let fixed = await target.replace(pattern, (match) => {
        return match.replace(/\s+/g, '');
    });

    return fixed;
}

async function connectLinks(target) {
    
    let pattern = /\] +\(/gm;
    let fixed = await target.replace(pattern, (match) => {
        return ']('
    });

    return fixed;
}

async function fixLinks(target) {

    //Old pattern: (It used to find the 'see more' text and change it)
    //let pattern = /(?: ?\([^\)\s]+[ :]?(?:\[|(?:\\\[))+((?:rc:|https:|\.*)?\/\/?(?:[\w-_\.]+\/)*((?:[A-Za-z-_]+(?:\d+)?))(?:\/[0-9]+)?(?:\.\w+)?\/?)\/?(?:\]|\\\])*(?:\)|\])*[^\n \.])|(?:\[|(?:\\\[))+((?:rc:|https:|\.*)?\/\/?(?:[\w-_\.]+\/)*((?:[A-Za-z-_]+(?:\d+)?))(?:\/[0-9]+)?(?:\.\w+)?\/?)(?:\]|(?:\\\]))*/gm;
    

    let pattern = '(?:\[|(?:\\\[))+((?:rc:|https:|\.*)?\/\/?(?:[\w\-_\.]+\/)*((?:[A-Za-z-_]+(?:\d+)?))(?:\/[0-9]+)?(?:\.\w+)?\/?)(?:\]|(?:\\\]))+'
    
    let fixed = await cleanLinks(target)
    .then( (response) => connectLinks(response) )
    .then( (response) => response.replace(pattern, (match, p1, p2) => {

        let path = p1
        let slug = p2
        console.log(slug)
        let tituloPartes = slug.split('-').map((string) => string[0].toUpperCase() + string.slice(1))
        let titulo = tituloPartes.join(' ')
        let enlace = '[' + titulo + ']' + '(' + path + ')'
        return enlace
    }));
    return fixed;
}

async function fixSpaceBeforeLineFeed(target){

    let pattern = / +\n/gm
    let fixed = await target.replace(pattern, (match) =>`\n`)
    
    return fixed
}

async function addPunctuationSpace(target){
    let pattern = /([,.?!])([^"”“‘’'\d.,)\s\n])(?![^(]*[)])/gm
    let fixed = await target.replace(pattern, (match,p1,p2) =>`${p1} ${p2}`)
    
    return fixed
}

async function formatStrongsHeading(target){
    let pattern = /^.+(?:strong[^HG:]*)(?= *: *[HG]*)/gim
    let fixed = await target.replace(pattern, (match,p1,p2) =>`* Números de Strong`)
    
    return fixed
}

async function formatSeeMore(target){
    
    let pattern = /(?:([ (]+)(?:(?:Ver[  :]+)|(?:Vea[s :])|(?:see[ :]))[^\[]*)(?=\[)/gim
    let fixed = await target.replace(pattern, (match, p1) =>`${p1}ver también: `)
    
    return fixed
}

async function cleanTrashCharacters(target){
    
    let pattern = / |​/gm
    let fixed = await target.replace(pattern, (match) =>` `)
    
    return fixed
}

async function tWFixTitles(target,tittle,replace){
    
    let pattern = new RegExp(`^(?: *(?:#{2})* *)${tittle}.+`, `gim`);
    let fixed = target.replace(pattern, (match) =>`## ${replace}`)
    
    return fixed
}

async function unSubTitle(target){
    
    //^#{2,} *(.+)
    let pattern = /^#{2,} +(?!definici.*)(.+)/gim;
    let fixed = target.replace(pattern, (match, p) => p)
    
    return fixed
}

async function fixTranslationWords(target){
    
    let fixed = await tWFixTitles(target, 'suger', 'Sugerencias de traducción')
    .then( response => tWFixTitles(response, 'translation suggestions', 'Sugerencias de traducción') )
    .then( response => tWFixTitles(response, 'definic', 'Definición') )
    .then( response => tWFixTitles(response, 'hechos', 'Definición') )
    .then( response => tWFixTitles(response, 'refer', 'Referencias bíblicas') )
    .then( response => tWFixTitles(response, 'bible', 'Referencias bíblicas') )
    .then( response => tWFixTitles(response, 'dat', 'Datos de esta palabra') )
    .then( response => tWFixTitles(response, 'word', 'Datos de esta palabra') )
    .then( response => tWFixTitles(response, 'ejemplos (de|en) las h', 'Ejemplos de las historias bíblicas') )
    .then( response => tWFixTitles(response, 'ejemplos (de|en) las h', 'Ejemplos de las historias bíblicas') ) 
    .then( response => formatStrongsHeading(response) )   
    
    return fixed
}

function cleanEndSpaces(target) {
    const pattern = / +$/gm;
    let fixed = target.replace(pattern, '');
    return fixed;
}

async function fixAsterisk(target) {
     /(?:\\\*|\*){2} *([^\n\*\\]+) *(?:\\\*|\*){2}/gm;
    let fixed = target.replace(pattern, (match, p1) =>`**${cleanEndSpaces(p1)}**`);
    return fixed;
}

async function fixStarEnclosures(target) {
    let pattern = /(\w?)(?:\\\*|\*){2} *([^\n*\\]+) *(?:\\\*|\*){2}(\w?)/gm;
    let fixed = target.replace(pattern, (match, p1, p2, p3) =>`${p1 ? (p1 + ' ') : ''}**${cleanEndSpaces(p2)}**${p3 ? (' ' + p3) : ''}`);
    return fixed;
}

function unescapeSlash(target){
    return target.replace(/\\(.)/g, (match, p) => p)
}

async function fixUnderScoreEnclosures(target) {
    let pattern = /([A-Za-z0-9À-ú?!.,;]?)((?:\\_){1,2}|\_{1,2}) *([^\n*_\\]+) *(?:(?:\\_){1,2}|\_{1,2})([A-Za-z0-9À-ú]?)/gm;
    let fixed = target.replace(pattern, (match, p1, p2, p3, p4) =>`${p1 ? (p1 + ' ') : ''}${unescapeSlash(p2)}${cleanEndSpaces(p3)}${unescapeSlash(p2)}${p4 ? (' ' + p4) : ''}`);
    return fixed;
}

async function cleanQuotes(target) {
    let pattern = /(“|”)|(‘|’)/gm;
    let fixed = target.replace(pattern, (match, p1, p2) => p1 ? `"` : `'`);
    return fixed;
}

async function fixQuotes(target) {

    let pattern = /"([^"]+)"|'([^"']+)'/gm;

    let fixed = await cleanQuotes(target)
    .then( response => response.replace(pattern, (match, p1, p2) => {

        if (p1) {

            let output = p1.replace(/'([^"']+)'/gm, (match, p) => {
                return `‘${p}’`;
            });
            return `“${output}”`;
        }
        if (p2) {

            return `‘${p2}’`;
        }
    }));

    return fixed;
}

async function cleanDoubleSpaces(target){
    let pattern = /(.) {2,}(?!=(?:\*{1}|_{1}))/gm
    let fixed = target.replace(pattern, (match, p) => `${p} `);
    return fixed;
}

async function showSubtitles(target){
    let pattern = /(?:^(?:\s)*#{2,} ?(.+)\s+)/gm
    let found = await target.replace(pattern, (match, p) =>{
        console.log(p)
    })
}

function cleanEndPunctuation(target){
    return target.replace(/[.:;,]$/g,'')
}

async function fixTitles(target) {

    let pattern = /(?:^(?:\s)*(#+) ?(.+) *)|(?:(?:\s)+(#+) ?(.+) *\s+)/g;

    let fixed = target.replace(pattern, (match, p1, p2, p3, p4) => {
        
        let hash = p1 ? p1 : p3
        let title = p2 ? p2.trim() : p4.trim()

        if(p1) return `${hash} ${cleanEndPunctuation(title)}`

        else return `\n\n${hash} ${cleanEndPunctuation(title)}\n\n`

    })
    
    return fixed;
}
async function cleanEdges(target) {
    let pattern = /^(\s+)|(.)\s*$/g;
    let fixed = await target.replace(pattern, (match, p1, p2) => {
        if (p1)
            return ''
        else
            return `${p2}\n`
    });
    return fixed;
}

async function refactorList(target) {
    let pattern = /^(?: *\* *_* *([^_\*\n]*[^-])(?:[\s_-]+)+\s+)(?!\*|#)(?:([^#\n]+))\s*$/gm
    let fixed = target.replace(pattern, (match, p1, p2)=>{
        if(!p2) //console.log(p1)
        if(p1 && p2)
            return `\n# ${cleanEdges(p1)}\n\n${cleanEdges(p2)}\n`
        else
            return null
    })
    return fixed
}

async function fixLists(target) {

    const allPattern = /^(?: *\\*)([*\-+])[^*\-+](.+) *\s*/gm
   
    //Add line after each list element
    let fixed = await target.replace(allPattern, (match, p1, p2)=>{
        return `${p1} ${p2}\n\n`
    })

    const firstPattern = /^((?: *[^*\-+\s]).+)\s+^(?: *\\*)([*\-+])[^*\-+](.+ *\n+)/gm
    //Add line before first list element
    let output = await fixed.replace(firstPattern, (match, p1, p2, p3) => {
        //console.log(p1)
        return `${p1}\n\n${p2} ${p3}`
    })

    return output
}

async function cleanOBS(target) {
    let pattern = /^(?:## .+ ##\n+[^#]+)*(?:#* *(?:Translation Notes|Notas de traducci[oó]n).+#*){1}\n+([^#]+)/gim;
    let fixed = target.replace(pattern, (match, p) => {
        return p;
    });
    return fixed;
}

function fixVersesSpaces(target){
    const pattern = /(\d): (\d)/gm
    let fixed = target.replace(pattern, (match, p1, p2) => {
        return p1 + ':' + p2;
    });
    return fixed;
}
