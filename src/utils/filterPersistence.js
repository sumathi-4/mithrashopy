export const loadPersistentFilters = () => {
  try {
    const data = sessionStorage.getItem('mithirashoppy_persistent_filters');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const savePersistentFilters = (filters) => {
  try {
    sessionStorage.setItem('mithirashoppy_persistent_filters', JSON.stringify(filters));
  } catch (e) {}
};

export const clearPersistentFilters = () => {
  try {
    sessionStorage.removeItem('mithirashoppy_persistent_filters');
  } catch (e) {}
};
