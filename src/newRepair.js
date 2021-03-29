import marked from 'marked';
import M from 'materialize-css';

export function newRepair() {

    let button = document.getElementById('toggle-button');

    if (button.getAttribute('data-toggle') == 'code')
        toggleView(button);

    let resPreview = document.getElementById('result-preview');
    let srcPreview = document.getElementById('source-preview');
    resPreview.innerHTML = '';
    srcPreview.innerHTML = '';

    let salida = document.getElementById('salida');
    let entrada = document.getElementById('entrada');
    entrada.value = '';
    M.textareaAutoResize(entrada);
    salida.value = '';
    M.textareaAutoResize(salida);
    entrada.focus();
    M.updateTextFields();
}
export function toggleView(button) {
    if (button.getAttribute('data-toggle') == 'preview') {
        button.innerHTML = '<i class="material-icons left">code</i>Ver código';
        button.setAttribute('data-toggle', 'code');
    }

    else {
        button.innerHTML = '<i class="material-icons left">visibility</i>Previsualizar';
        button.setAttribute('data-toggle', 'preview');
    }

    let code = document.querySelectorAll(".code");
    code.forEach((element) => {
        element.classList.toggle("active");
    });

    let preview = document.querySelectorAll(".preview");
    preview.forEach((element) => {
        element.classList.toggle("active");
    });
}
export async function fixAll(target) {

    let fixed = target;

    let cleanObs = document.getElementById('limpiar-obs').checked;
    let refactorLists = document.getElementById('listas').checked;

    if (cleanObs)
        fixed = await cleanOBS(fixed);
    if (refactorLists)
        fixed = await refactorList(fixed);

    fixed = await fixLinks(fixed);
    fixed = await fixTitles(fixed);
    fixed = await fixQuotes(fixed);
    fixed = await fixAsterisk(fixed);
    fixed = await cleanEdges(fixed);

    showResults(target, fixed);
}
function showResults(input, output) {
    let salida = document.getElementById('salida');
    let resPreview = document.getElementById('result-preview');
    let srcPreview = document.getElementById('source-preview');
    salida.value = output;
    M.updateTextFields();
    M.textareaAutoResize(salida);
    salida.select();
    document.execCommand('copy');
    M.toast({ html: 'Reultado Copiado' });
    srcPreview.innerHTML = marked(input);
    resPreview.innerHTML = marked(output);
}
function cleanLinks(target) {
    let pattern = /(?:\[|(?:\\\[))+(?:rc:|https:|\.*)(?:.+)(?:\]|\\\])*\]/g;
    let fixed = target.replace(pattern, (match) => {
        return match.replace(/\s+/g, '');
    });
    console.log(fixed);
    return fixed;
}
function fixLinks(target) {
    let pattern = /(?: ?\([^\)\s]+[ :]?(?:\[|(?:\\\[))+((?:rc:|https:|\.*)?\/\/?(?:[\w-_\.]+\/)*((?:[A-Za-z-_]+(?:\d+)?))(?:\/[0-9]+)?(?:\.\w+)?\/?)\/?(?:\]|\\\])*(?:\)|\])*[^\n \.])|(?:\[|(?:\\\[))+((?:rc:|https:|\.*)?\/\/?(?:[\w-_\.]+\/)*((?:[A-Za-z-_]+(?:\d+)?))(?:\/[0-9]+)?(?:\.\w+)?\/?)(?:\]|(?:\\\]))*/gm;

    let fixed = cleanLinks(target);
    fixed = fixed.replace(pattern, (match, p1, p2, p3, p4) => {

        let path = '';
        let slug = '';

        if (p1) {
            path = p1;
            slug = p2;
        }

        if (p3) {
            path = p3;
            slug = p4;
        }

        let tituloPartes = slug.split('-');
        tituloPartes = tituloPartes.map((string) => string[0].toUpperCase() + string.slice(1));
        let titulo = tituloPartes.join(' ');
        let enlace = '[' + titulo + ']' + '(' + path + ')';
        return ` (ver: ${enlace})`;
    });
    return fixed;
}
function fixAsterisk(target) {
    let pattern = /(?:(?:\\\*|\*){2}(?: )*([^\n\*\\]+)(?: )*(?:\\\*|\*){2})/gm;
    let fixed = target.replace(pattern, (match, p1, p2) => p1 ? `**${p1}**` : `**${p2}**`);
    return fixed;
}
function cleanQuotes(target) {
    let pattern = /(“|”)|(‘|’)/gm;
    let fixed = target.replace(pattern, (match, p1, p2) => p1 ? `"` : `'`);
    return fixed;
}
function fixQuotes(target) {

    let pattern = /"([^"]+)"|'([^"']+)'/gm;

    let fixed = cleanQuotes(target);
    fixed = fixed.replace(pattern, (match, p1, p2) => {

        if (p1) {
            p1 = p1.replace(/'([^"']+)'/gm, (match, p) => {
                return `‘${p}’`;
            });
            console.log(`“${p1}”`);
            return `“${p1}”`;
        }

        if (p2) {
            console.log(`‘${p2}’`);
            return `‘${p2}’`;
        }
    });

    return fixed;
}
function fixTitles(target) {
    let pattern = /(?:^\s+)?#+(.+)\s+/gm;
    let fixed = target.replace(pattern, (match, p) => {
        p = cleanEdges(p);
        return `\n# ${p}\n\n`;
    });
    return fixed;
}
function cleanEdges(target) {
    let pattern = /^\s+|\s+$/g;
    let fixed = target.replace(pattern, (match, p) => {
        return '';
    });
    return fixed;
}
function refactorList(target) {
    let pattern = /^(?: *\* *_* *([^_\*\n]*[^-]) *_*\s*-?\s+)(?!\*|#)(?:([^#\n]+)) *$/gm;
    let fixed = target.replace(pattern, (match, p1, p2) => {
        if (p1 && p2)
            return `\n# ${cleanEdges(p1)}\n\n${cleanEdges(p2)}\n`;

        return p1 ? `\n* ${cleanEdges(p1)}\n\n` : `\n* ${cleanEdges(p2)}\n\n`;
    });
    return fixed;
}
function cleanOBS(target) {
    let pattern = /^(?:## .+ ##\n+[^#]+)*(?:#* *(?:Translation Notes|Notas de traducci[oó]n).+#*){1}\n+([^#]+)/gim;
    let fixed = target.replace(pattern, (match, p) => {
        console.log(p);
        return p;
    });
    return fixed;
}
