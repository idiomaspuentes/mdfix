function cleanLinks(target) {
    let pattern = /(?:\[|(?:\\\[))+(?:rc:|https:|\.*)(?:.+)(?:\]|\\\])*\]/g;
    let fixed = target.replace(pattern, (match) => {
        return match.replace(/\s+/g, '');
    });
    //console.log(fixed);
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
            //console.log(`“${p1}”`);
            return `“${p1}”`;
        }

        if (p2) {
            //console.log(`‘${p2}’`);
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
        //console.log(p);
        return p;
    });
    //console.log('fixed:', fixed);
    return fixed;
}

export async function fixAll(target) {

    let fixed = await target;
        fixed = await cleanOBS(fixed);
        fixed = await refactorList(fixed);
        fixed = await fixLinks(fixed);
        fixed = await fixTitles(fixed);
        fixed = await fixQuotes(fixed);
        fixed = await fixAsterisk(fixed);
        fixed = await cleanEdges(fixed);

    return fixed;
}