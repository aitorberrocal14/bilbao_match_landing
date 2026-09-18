/**
 * Collects the Issuu links of a publisher profile.
 *
 * This one does NOT run in Node: paste it into the browser console while the
 * Issuu profile page is open. The profile loads its publications as you scroll,
 * so scroll to the very bottom first.
 *
 *   1. Open https://issuu.com/turismobilbao
 *   2. Scroll to the bottom until no more publications appear
 *   3. Press F12 → Console, paste all of this, press Enter
 *   4. The list is printed and copied to the clipboard — paste it back
 *
 * Each line is "Title | https://issuu.com/turismobilbao/docs/…", which is
 * exactly what assets/js/data/discover.js needs.
 */

(function () {
  var seen = {};
  var rows = [];

  document.querySelectorAll('a[href*="/docs/"]').forEach(function (a) {
    var url = a.href.split('?')[0];
    if (seen[url]) return;
    seen[url] = true;

    // The title is either the link text, its aria-label, or the image alt.
    var img = a.querySelector('img');
    var title =
      (a.getAttribute('aria-label') || '').trim() ||
      (a.textContent || '').trim() ||
      (img && (img.alt || '').trim()) ||
      url.split('/docs/')[1];

    rows.push(title.replace(/\s+/g, ' ') + ' | ' + url);
  });

  var out = rows.join('\n');
  console.log('%c' + rows.length + ' publications found', 'font-weight:bold');
  console.log(out);

  try {
    copy(out); // devtools helper
    console.log('%cCopied to the clipboard.', 'color:green');
  } catch (e) {
    console.log('Select the list above and copy it by hand.');
  }

  return out;
})();
