const DB_KEY = 'tagscanner_tags';

export const getAllTags = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading tags', err);
    return [];
  }
};

export const saveTag = (tag) => {
  try {
    const tags = getAllTags();
    const existingIndex = tags.findIndex((t) => t.code === tag.code);
    if (existingIndex >= 0) {
      tags[existingIndex] = tag;
    } else {
      tags.push(tag);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(tags));
    return true;
  } catch (err) {
    console.error('Error saving tag', err);
    return false;
  }
};

export const removeTag = (code) => {
  try {
    const tags = getAllTags();
    const newTags = tags.filter((t) => t.code !== code);
    localStorage.setItem(DB_KEY, JSON.stringify(newTags));
    return true;
  } catch (err) {
    console.error('Error removing tag', err);
    return false;
  }
};

export const disableTag = (code, disabled) => {
  try {
    const tags = getAllTags();
    const tag = tags.find((t) => t.code === code);
    if (tag) {
      tag.disabled = disabled;
      localStorage.setItem(DB_KEY, JSON.stringify(tags));
    }
    return true;
  } catch (err) {
    console.error('Error disabling tag', err);
    return false;
  }
};

export const validateEntry = (code) => {
  const tags = getAllTags();
  const tag = tags.find((t) => t.code === code);

  if (!tag) {
    return { valid: false, reason: 'Code not found in system' };
  }

  if (tag.disabled) {
    return { valid: false, reason: 'Tag has been disabled by admin' };
  }

  // We can add expiry logic back if needed, but requirements didn't mention it this time.
  return { valid: true };
};
