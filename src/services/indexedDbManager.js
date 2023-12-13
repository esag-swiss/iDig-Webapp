export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("localTrenchesVersion", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("checkedTrenchesStore", {
        keyPath: "trenchName",
      });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const storeDataInIndexedDB = async (db, trenchName, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["checkedTrenchesStore"], "readwrite");
    const store = transaction.objectStore("checkedTrenchesStore");

    const clonableData = JSON.stringify(data);

    const request = store.put({ trenchName, clonableData });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};
export const readDataInIndexedDB = async (db, trenchName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["checkedTrenchesStore"], "readonly");
    const store = transaction.objectStore("checkedTrenchesStore");
    const request = store.get(trenchName);

    request.onsuccess = (event) => {
      const data = event.target.result;
      if (data) {
        resolve(data.clonableData);
      } else {
        // Aucune donnée trouvée pour le trenchName spécifié
        resolve(null);
      }
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};
