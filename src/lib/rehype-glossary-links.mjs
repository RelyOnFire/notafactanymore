const GLOSSARY_PREFIX = 'glossary:';
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function isGermanSource(file) {
  const sourcePath = typeof file?.path === 'string' ? file.path.replaceAll('\\', '/') : '';
  return sourcePath.includes('/src/data/translations/de/');
}

function walk(node, file) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && node.tagName === 'a') {
    const href = node.properties?.href;
    if (typeof href === 'string' && href.startsWith(GLOSSARY_PREFIX)) {
      const id = href.slice(GLOSSARY_PREFIX.length);
      if (!ID_PATTERN.test(id)) throw new Error(`Invalid glossary id ${JSON.stringify(id)}`);
      node.properties = {
        ...node.properties,
        href: `${isGermanSource(file) ? '/de/glossary/' : '/glossary/'}#${id}`,
        className: ['glossary-term'],
        dataGlossaryId: id,
        ariaDescribedby: 'glossary-popover-definition',
      };
    }
  }
  if (Array.isArray(node.children)) for (const child of node.children) walk(child, file);
}
export default function rehypeGlossaryLinks() { return (tree, file) => walk(tree, file); }
