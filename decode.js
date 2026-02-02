const fs = require('fs');

// Read the file fresh
let content = fs.readFileSync('c:\\Users\\sebmo\\Downloads\\flooder\\blooket\\hiddenstuff', 'utf8');

// Step 1: Remove 'javascript:' prefix
content = content.replace(/^javascript:\s*/, '');

// Step 2: Fix the URL encoding - remove ALL spaces
content = content.replace(/ /g, '');

// Step 3: URL decode
content = content.replace(/%([0-9A-Fa-f]{2})/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));

// Step 4: Decode hex escapes EXCEPT quotes, newlines, tabs, backslash
// These must stay escaped to preserve valid JavaScript strings
const keepEscaped = new Set(['27', '22', '0a', '0d', '09', '5c']);

content = content.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => {
    const lowerHex = hex.toLowerCase();
    if (keepEscaped.has(lowerHex)) {
        return match; // Keep escaped
    }
    return String.fromCharCode(parseInt(hex, 16));
});

// Step 5: Fix common keyword spacing issues caused by minification
content = content.replace(/typeof_0x/g, 'typeof _0x');
content = content.replace(/return_0x/g, 'return _0x');
content = content.replace(/new_0x/g, 'new _0x');
content = content.replace(/var_0x/g, 'var _0x');
content = content.replace(/const_0x/g, 'const _0x');
content = content.replace(/let_0x/g, 'let _0x');
content = content.replace(/function_0x/g, 'function _0x');
content = content.replace(/delete_0x/g, 'delete _0x');

// Fix for...in and for...of patterns (variable followed by 'in' or 'of' without space)
// Pattern: _0x[hex]in or _0x[hex]of 
content = content.replace(/(_0x[0-9a-f]+)(in)(\s|_0x|\[)/gi, '$1 $2 $3');
content = content.replace(/(_0x[0-9a-f]+)(of)(\s|_0x|\[|\()/gi, '$1 $2 $3');

// Also fix: let _0xABCin -> let _0xABC in
content = content.replace(/(let\s+_0x[0-9a-f]+)(in\s)/gi, '$1 $2');
content = content.replace(/(let\s+_0x[0-9a-f]+)(of[\s\(\[])/gi, '$1 $2');
content = content.replace(/(var\s+_0x[0-9a-f]+)(in\s)/gi, '$1 $2');
content = content.replace(/(var\s+_0x[0-9a-f]+)(of[\s\(\[])/gi, '$1 $2');

// Fix additional patterns
content = content.replace(/case_0x/g, 'case _0x');
content = content.replace(/await_0x/g, 'await _0x');
content = content.replace(/of_0x/g, 'of _0x');

// Fix for (const/let/var _0x...ofdocument or ofObject or ofArray etc
content = content.replace(/(const\s+_0x[0-9a-f]+)(of)(document|Object|Array|\[)/gi, '$1 $2 $3');
content = content.replace(/(let\s+_0x[0-9a-f]+)(of)(document|Object|Array|\[)/gi, '$1 $2 $3');
content = content.replace(/(var\s+_0x[0-9a-f]+)(of)(document|Object|Array|\[)/gi, '$1 $2 $3');

// Fix for destructuring: for([x,y]of -> for([x,y] of
content = content.replace(/\](of)([^\s])/g, '] $1 $2');

// Fix more keyword patterns
content = content.replace(/returnObject/g, 'return Object');
content = content.replace(/returnArray/g, 'return Array');
content = content.replace(/return_/g, 'return _');
content = content.replace(/returndocument/g, 'return document');
content = content.replace(/returnalert/g, 'return alert');
content = content.replace(/returntypeof/g, 'return typeof');

// Fix return + built-in patterns
content = content.replace(/returnString/g, 'return String');
content = content.replace(/returnRegExp/g, 'return RegExp');
content = content.replace(/returnnew/g, 'return new');
content = content.replace(/return!/g, 'return !');

// Fix await and new patterns
content = content.replace(/awaitnew/g, 'await new');
content = content.replace(/awaitfetch/g, 'await fetch');
content = content.replace(/await_0x/g, 'await _0x');

// Fix async arrow function pattern: async_0x... => async _0x...
content = content.replace(/async(_0x[0-9a-f]+)/gi, 'async $1');

// Fix new + builtin patterns
content = content.replace(/newPromise/g, 'new Promise');
content = content.replace(/newArray/g, 'new Array');
content = content.replace(/newObject/g, 'new Object');
content = content.replace(/newRegExp/g, 'new RegExp');
content = content.replace(/newMap/g, 'new Map');
content = content.replace(/newSet/g, 'new Set');
content = content.replace(/newDate/g, 'new Date');
content = content.replace(/newError/g, 'new Error');

// Fix else patterns
content = content.replace(/else_0x/g, 'else _0x');
content = content.replace(/elseconsole/g, 'else console');
content = content.replace(/elsereturn/g, 'else return');
content = content.replace(/elseif/g, 'else if');
content = content.replace(/elsebreak/g, 'else break');
content = content.replace(/elsethrow/g, 'else throw');

// Fix async patterns - ensure async function stays together
content = content.replace(/async\s*\n+\s*function/g, 'async function');

// Fix for (let _0xXXXin( patterns
content = content.replace(/(_0x[0-9a-f]+)(in)\(/gi, '$1 $2 (');

// Write the fully decoded content
fs.writeFileSync('c:\\Users\\sebmo\\Downloads\\flooder\\blooket\\hiddenstuff-decoded.js', content);

console.log('Done! Length:', content.length);

// Also check if beautified file exists and fix async function split
const beautifiedPath = 'c:\\Users\\sebmo\\Downloads\\flooder\\blooket\\hiddenstuff-deobfuscated.js';
if (fs.existsSync(beautifiedPath)) {
    let beautified = fs.readFileSync(beautifiedPath, 'utf8');
    // Fix: async\n\s*function -> async function (same line)
    beautified = beautified.replace(/async\s*\n\s*function/g, 'async function');
    fs.writeFileSync(beautifiedPath, beautified);
    console.log('Fixed async function splits in beautified file');
}
