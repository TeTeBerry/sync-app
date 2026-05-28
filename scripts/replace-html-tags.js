const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const needed = new Set();
  function addComp(name) { needed.add(name); }

  // Check for HTML tags
  const checks = {
    div: content.includes('<div') || content.includes('</div>'),
    span: content.includes('<span') || content.includes('</span>'),
    img: content.includes('<img'),
    p: content.includes('<p') || content.includes('</p>'),
    button: content.includes('<button') || content.includes('</button>'),
    input: content.includes('<input'),
    article: content.includes('<article') || content.includes('</article>'),
    section: content.includes('<section') || content.includes('</section>'),
    header: content.includes('<header') || content.includes('</header>'),
    main: content.includes('<main') || content.includes('</main>'),
    footer: content.includes('<footer') || content.includes('</footer>'),
    h1: content.includes('<h1') || content.includes('</h1>'),
    h2: content.includes('<h2') || content.includes('</h2>'),
    h3: content.includes('<h3') || content.includes('</h3>'),
    h4: content.includes('<h4') || content.includes('</h4>'),
    h5: content.includes('<h5') || content.includes('</h5>'),
    h6: content.includes('<h6') || content.includes('</h6>'),
    strong: content.includes('<strong') || content.includes('</strong>'),
    em: content.includes('<em') || content.includes('</em>'),
    small: content.includes('<small') || content.includes('</small>'),
    br: content.includes('<br'),
    a: content.includes('<a '),
  };

  // Simple replacements
  if (checks.div) {
    content = content.replace(/<div/g, '<View');
    content = content.replace(/<\/div>/g, '</View>');
    addComp('View');
    modified = true;
  }

  if (checks.span) {
    content = content.replace(/<span/g, '<Text');
    content = content.replace(/<\/span>/g, '</Text>');
    addComp('Text');
    modified = true;
  }

  if (checks.img) {
    content = content.replace(/<img\b([^>]*)>/g, (match, attrs) => {
      let newAttrs = attrs.replace(/\s+alt="[^"]*"/g, '');
      newAttrs = newAttrs.replace(/\s+loading="[^"]*"/g, '');
      return `<Image${newAttrs} />`;
    });
    addComp('Image');
    modified = true;
  }

  if (checks.p) {
    content = content.replace(/<p\b/g, '<Text');
    content = content.replace(/<\/p>/g, '</Text>');
    addComp('Text');
    modified = true;
  }

  if (checks.button) {
    content = content.replace(/<button\b/g, '<Button');
    content = content.replace(/<\/button>/g, '</Button>');
    addComp('Button');
    modified = true;
  }

  if (checks.input) {
    content = content.replace(/<input\b/g, '<Input');
    content = content.replace(/onChange=/g, 'onInput=');
    addComp('Input');
    modified = true;
  }

  if (checks.article) {
    content = content.replace(/<article/g, '<View');
    content = content.replace(/<\/article>/g, '</View>');
    addComp('View');
    modified = true;
  }

  if (checks.section) {
    content = content.replace(/<section/g, '<View');
    content = content.replace(/<\/section>/g, '</View>');
    addComp('View');
    modified = true;
  }

  if (checks.header) {
    content = content.replace(/<header/g, '<View');
    content = content.replace(/<\/header>/g, '</View>');
    addComp('View');
    modified = true;
  }

  if (checks.main) {
    content = content.replace(/<main/g, '<View');
    content = content.replace(/<\/main>/g, '</View>');
    addComp('View');
    modified = true;
  }

  if (checks.footer) {
    content = content.replace(/<footer/g, '<View');
    content = content.replace(/<\/footer>/g, '</View>');
    addComp('View');
    modified = true;
  }

  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    if (content.includes(`<${tag}`) || content.includes(`</${tag}>`)) {
      content = content.replace(new RegExp(`<${tag}\\b`, 'g'), '<Text');
      content = content.replace(new RegExp(`</${tag}>`, 'g'), '</Text>');
      addComp('Text');
      modified = true;
    }
  });

  if (checks.strong) {
    content = content.replace(/<strong>/g, '<Text style={{fontWeight:"bold"}}>');
    content = content.replace(/<\/strong>/g, '</Text>');
    addComp('Text');
    modified = true;
  }

  if (checks.em) {
    content = content.replace(/<em>/g, '<Text>');
    content = content.replace(/<\/em>/g, '</Text>');
    addComp('Text');
    modified = true;
  }

  if (checks.small) {
    content = content.replace(/<small>/g, '<Text>');
    content = content.replace(/<\/small>/g, '</Text>');
    addComp('Text');
    modified = true;
  }

  if (checks.br) {
    content = content.replace(/<br\s*\/?>/g, '');
    modified = true;
  }

  if (checks.a) {
    content = content.replace(/<a\b/g, '<View');
    content = content.replace(/<\/a>/g, '</View>');
    addComp('View');
    modified = true;
  }

  // Add import if needed
  if (needed.size > 0) {
    const comps = Array.from(needed).sort();
    const importLine = `import { ${comps.join(', ')} } from '@tarojs/components';`;

    if (!content.includes("@tarojs/components")) {
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIdx = i;
        }
      }
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, importLine);
        content = lines.join('\n');
      } else {
        content = importLine + '\n' + content;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return { file: filePath, components: Array.from(needed) };
  }
  return null;
}

const srcDir = path.resolve(__dirname, '..', 'src');
function findTsx(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findTsx(fullPath, files);
    } else if (fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findTsx(srcDir);
const results = [];
for (const f of files) {
  const result = processFile(f);
  if (result) results.push(result);
}

console.log(`Modified ${results.length} files:`);
for (const r of results) {
  console.log(`  ${path.relative(srcDir, r.file)}: ${r.components.join(', ')}`);
}
