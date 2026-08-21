const GLOSSARY_PREFIX = 'glossary:';
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function walk(node, file) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'element' && node.tagName === 'a') {
    const href = node.properties?.href;
    if (typeof href === 'string' && href.startsWith(GLOSSARY_PREFIX)) {
      const id = href.slice(GLOSSARY_PREFIX.length);
      if (!ID_PATTERN.test(id)) {
        const location = file?.path ? ` in ${file.path}` : '';
        throw new Error(`Invalid glossary id ${JSON.stringify(id)}${location}`);
      }

      node.tagName = 'button';
      node.properties = {
        type: 'button',
        className: ['glossary-term'],
        dataGlossaryId: id,
        ariaControls: 'glossary-popover',
        ariaExpanded: 'false',
      };
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, file);
  }
}

export default function rehypeGlossaryLinks() {
  return (tree, file) => walk(tree, file);
}
