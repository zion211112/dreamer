// Verify which tail replacement yields a valid script (vm.Script = parse-only, no browser run).
const fs = require('fs');
const vm = require('vm');
const s = fs.readFileSync('.bd-check/capture.txt', 'utf8');

function parses(label, text) {
  try { new vm.Script(text); console.log('OK  ', label); return true; }
  catch (e) { console.log('FAIL', label, '->', e.message); return false; }
}

// Baseline: does the ORIGINAL parse as a script?
parses('original', s);

// The IIFE: (() => { ... return (function f(scope){...})(); })()
// We want the inner call to pass '.coord'. The inner call is the first `()` we can
// reach as the argument list right after the function body + closing paren.
// Replace the exact tail "  };\n})(); })()" with "  };\n}('.coord'); })()".
const tail = '  };\n})(); })()';
console.log('tail present:', s.includes(tail));
const scoped = s.replace(tail, "  };\n})('.coord'); })()");
parses('scoped-variant', scoped);
