// Account-scoped local library. Version 1's single image is retained on upgrade.
export function imageStore(mode, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('studyflow-custom-images', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
      if (!db.objectStoreNames.contains('libraries')) db.createObjectStore('libraries');
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error('Feche abas antigas do StudyFlow e tente novamente.'));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['images', 'libraries'], 'readwrite');
      const libraries = tx.objectStore('libraries'), legacy = tx.objectStore('images');
      const owner = typeof value === 'string' ? value : value.uid;
      const read = libraries.get(owner);
      let result;
      read.onsuccess = () => {
        const old = legacy.get(owner);
        old.onsuccess = () => {
          const items = read.result || (old.result ? [{id:'legacy', name:'Minha imagem salva', blob:old.result, tone:'light'}] : []);
          if (mode === 'get') result = items.find(i => i.id === (value.id || 'legacy'))?.blob;
          else if (mode === 'list') result = items;
          else if (mode === 'put') {
            items.push({id:value.id, name:value.name, blob:value.blob, tone:value.tone});
            result = value.id;
          } else if (mode === 'delete') {
            const index = items.findIndex(i => i.id === value.id);
            if (index >= 0) items.splice(index, 1);
          }
          libraries.put(items, owner);
          if (old.result) legacy.delete(owner);
        };
      };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || Error('Sua biblioteca comporta até 24 imagens. Remova uma antes de adicionar outra.')); };
    };
  });
}
