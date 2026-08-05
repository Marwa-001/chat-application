function appendToLastPage(old, message) {
  if (!old?.pages?.length) return old;
  const alreadyExists = old.pages.some((page) => page.some((m) => m._id === message._id));
  if (alreadyExists) return old;

  const pages = [...old.pages];
  const lastIndex = pages.length - 1;
  pages[lastIndex] = [...pages[lastIndex], message];
  return { ...old, pages };
}

function updateInPages(old, updateFn) {
  if (!old?.pages?.length) return old;
  return { ...old, pages: old.pages.map((page) => page.map((m) => {
    const updated = updateFn(m);
    return updated !== undefined ? updated : m;
  })) };
}

// updateFn above needs a tweak: make it explicit rather than relying on undefined

function mapInPages(old, predicate, mapper) {
  if (!old?.pages?.length) return old;
  return {
    ...old,
    pages: old.pages.map((page) => page.map((m) => (predicate(m) ? mapper(m) : m))),
  };
}

function filterInPages(old, predicate) {
  if (!old?.pages?.length) return old;
  return { ...old, pages: old.pages.map((page) => page.filter(predicate)) };
}