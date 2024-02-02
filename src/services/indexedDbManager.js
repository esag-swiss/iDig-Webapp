export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("iDigIndexedDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Créer un object store pour les informations sur les tranchées
      if (!db.objectStoreNames.contains("checkedTrenchesStore")) {
        db.createObjectStore("checkedTrenchesStore", {
          keyPath: "trenchName",
        });
      }

      // Créer un object store pour les images raster
      if (!db.objectStoreNames.contains("rasterImagesStore")) {
        db.createObjectStore("rasterImagesStore", {
          keyPath: "imageTitle",
        });
      }
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

// Fonction pour ajouter une image à IndexedDB
export const addImageToDB = async (
  db,
  blob,
  imageTitle,
  width,
  height,
  planlatLngBounds
) => {
  const transaction = db.transaction(["rasterImagesStore"], "readwrite");
  const imageStore = transaction.objectStore("rasterImagesStore");

  // Créer un objet contenant les données de l'image
  const imageData = {
    imageTitle: imageTitle,
    imageBlob: blob,
    width: width,
    height: height,
    planlatLngBounds: planlatLngBounds,
  };

  imageStore.put(imageData);
  await transaction.complete;
};

// Fonction pour lire une image de IndexedDB
export const getImageFromDB = async (db, imageTitle) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["rasterImagesStore"], "readonly");
    const imageStore = transaction.objectStore("rasterImagesStore");

    const request = imageStore.get(imageTitle);

    request.onsuccess = (event) => {
      const result = event.target.result;

      if (result) {
        resolve(result);
      } else {
        console.log(
          "Aucune ImageData trouvée dans IndexedDB pour l'image",
          imageTitle
        );
        resolve(null); // L'image n'existe pas dans IndexedDB
      }
    };

    request.onerror = (event) => {
      console.error(
        "Erreur lors de la récupération de l'image depuis IndexedDB :",
        event.target.error
      );
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
