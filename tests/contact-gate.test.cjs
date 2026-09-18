const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const contact = read('app/(site)/contact/page.tsx');
const gate = read('components/PayGate.tsx');
const css = read('app/globals.css');

test('the contact page is minimal classic: heading, two lines, one place', () => {
  assert.ok(contact.includes('className="contact-classic"'));
  assert.ok(contact.includes('className="contact-title"'));
  assert.equal([...contact.matchAll(/className="contact-line"/g)].length, 2, 'exactly two lines: email, whatsapp');
  assert.ok(contact.includes('mailto:aptlabske@gmail.com?subject=Schools%20%2B%20partners'));
  assert.ok(contact.includes('https://wa.me/254704260906?text=Greetings.'));
  assert.ok(contact.includes('Kirinyaga, Kenya'));
});

test('no envelope, no sigil, no artwork of any kind survives', () => {
  for (const dead of ['vesica', 'sigil', 'Knock Knock', 'contact-plate', 'envelope', 'flap', 'stamp', 'seal', 'GeoArt', 'CONTACTS']) {
    assert.ok(!contact.toLowerCase().includes(dead), dead + ' should be gone');
  }
  assert.equal(contact.includes('<svg'), false, 'no artwork, no SVG');
  assert.ok(!css.includes('envelope') && !css.includes('contact-plate'), 'letter CSS should be out of globals.css');
});

test('the classic page carries no motion: no keyframes, no transforms', () => {
  assert.ok(css.includes('.contact-classic'));
  for (const dead of ['mail-rise', 'mail-fade', 'seal-pulse', 'contact-draw', 'contact-pulse', 'rotateX']) {
    assert.ok(!css.includes(dead), dead + ' should be gone');
  }
});

test('/contact is the only address the paywall leaves open', () => {
  const exempt = gate.match(/const EXEMPT = \[([^\]]*)\]/);
  assert.ok(exempt, 'EXEMPT list is missing');
  assert.deepEqual(
    exempt[1].split(',').map((s) => s.trim()).filter(Boolean),
    ['"/contact"']
  );
});

test('a locked page renders the paybill and no page content', () => {
  const childrenRenders = [...gate.matchAll(/\{children\}/g)];
  assert.equal(childrenRenders.length, 1, 'children must render on one path only');
  assert.ok(
    childrenRenders[0].index > gate.indexOf('if (isExempt(pathname) || unlocked)'),
    'that one path is the exempt one'
  );
  assert.ok(gate.includes('return <Paywall onUnlock={() => setUnlocked(true)} escape />;'));
});
