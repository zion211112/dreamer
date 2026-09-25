const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const contact = read('app/(site)/contact/page.tsx');
const contactCss = read('app/(site)/contact/contact.css');
const layout = read('app/(site)/layout.tsx');

// Walk a directory, collecting every .ts/.tsx/.css/.cjs source file.
function sources(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const n = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (['.next', 'node_modules'].includes(f.name)) continue;
      sources(n, out);
    } else if (/\.(tsx?|css|cjs)$/.test(f.name)) out.push(n);
  }
  return out;
}

test('the contact page is minimal classic: one column, two lines, one place', () => {
  assert.ok(contact.includes('className="contact-classic site-frame"'));
  assert.ok(contact.includes('className="contact-title"'));
  assert.equal([...contact.matchAll(/className="contact-line"/g)].length, 2, 'exactly two lines: email, whatsapp');
  assert.ok(contact.includes('mailto:aptlabske@gmail.com?subject=APT-LABS%20enquiry'));
  assert.ok(contact.includes('https://wa.me/254704260906?text=Greetings.'));
  assert.ok(contact.includes('Kirinyaga, Kenya'));
});

test('no envelope, no sigil, no hand-drawn artwork of any kind survives', () => {
  for (const dead of ['vesica', 'sigil', 'Knock Knock', 'contact-plate', 'envelope', 'flap', 'stamp', 'seal']) {
    assert.ok(!contact.toLowerCase().includes(dead), dead + ' should be gone');
  }
  // The identity mark comes back only as the shared GeoArt accent — never
  // hand-drawn inline SVG in the page itself.
  assert.equal(contact.includes('<svg'), false, 'no inline SVG in the page');
  assert.ok(contact.includes('GeoArt'), 'the shared GeoArt accent is allowed');
});

test('the classic page carries no motion: no keyframes, no transforms', () => {
  assert.ok(contactCss.includes('.contact-classic'), 'contact styles live in contact.css');
  for (const dead of ['mail-rise', 'mail-fade', 'seal-pulse', 'contact-draw', 'contact-pulse', 'rotateX', '@keyframes']) {
    assert.ok(!contactCss.includes(dead), dead + ' should be gone');
  }
});

test('the gate layer is fully out: no Paywall, PayGate, or gates.ts anywhere', () => {
  // The paywall was deliberately retired, not just bypassed: /contact (and
  // every page) is reachable by design, so no exemption list may reappear.
  assert.ok(!fs.existsSync(path.join(__dirname, '..', 'components', 'Paywall.tsx')), 'Paywall.tsx should stay deleted');
  assert.ok(!fs.existsSync(path.join(__dirname, '..', 'components', 'PayGate.tsx')), 'PayGate.tsx should stay deleted');
  assert.ok(!fs.existsSync(path.join(__dirname, '..', 'lib', 'gates.ts')), 'gates.ts should stay deleted');
  assert.ok(!layout.includes('Paywall'), 'the site layout wraps no gate');
  const stray = sources(path.join(__dirname, '..', 'app')).filter(
    (f) => /Paywall|PayGate|gates\.ts/.test(fs.readFileSync(f, 'utf8'))
  );
  assert.equal(stray.length, 0, 'no page may reference a gate: ' + stray.join(', '));
});
