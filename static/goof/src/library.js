const DATABASE_NAME = "goof-local-library";
const DATABASE_VERSION = 2;
const PROJECTS_STORE = "projects";
const ASSETS_STORE = "assets";
const COLLECTIONS_STORE = "collections";

let databasePromise;

function openDatabase() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not support local project storage."));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.addEventListener("upgradeneeded", () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
          database.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains(ASSETS_STORE)) {
          database.createObjectStore(ASSETS_STORE, { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains(COLLECTIONS_STORE)) {
          database.createObjectStore(COLLECTIONS_STORE, { keyPath: "id" });
        }
      });

      request.addEventListener("success", () => resolve(request.result), { once: true });
      request.addEventListener("error", () => {
        reject(request.error ?? new Error("Could not open the local library."));
      }, { once: true });
      request.addEventListener("blocked", () => {
        reject(new Error("The local library is blocked by another open GOOF tab."));
      }, { once: true });
    }).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("The local library request failed."));
    }, { once: true });
  });
}

function transactionResult(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new Error("The local library transaction was aborted."));
    }, { once: true });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new Error("The local library transaction failed."));
    }, { once: true });
  });
}

async function writeRecord(storeName, record) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  const completion = transactionResult(transaction);
  transaction.objectStore(storeName).put(record);
  await completion;
}

async function deleteRecord(storeName, id) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  const completion = transactionResult(transaction);
  transaction.objectStore(storeName).delete(id);
  await completion;
}

async function listRecords(storeName) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const completion = transactionResult(transaction);
  const [records] = await Promise.all([
    requestResult(transaction.objectStore(storeName).getAll()),
    completion,
  ]);
  return records;
}

export async function saveProject(project) {
  await writeRecord(PROJECTS_STORE, project);
}

export async function listProjects() {
  const projects = await listRecords(PROJECTS_STORE);
  return projects.sort((left, right) => right.updatedAt - left.updatedAt);
}

export async function deleteProject(id) {
  await deleteRecord(PROJECTS_STORE, id);
}

export async function saveImageAsset(asset) {
  await writeRecord(ASSETS_STORE, asset);
}

export async function deleteImageAsset(id) {
  await deleteRecord(ASSETS_STORE, id);
}

export async function listImageAssets() {
  const assets = await listRecords(ASSETS_STORE);
  return assets.sort((left, right) => right.createdAt - left.createdAt);
}

export async function saveCollection(collection) {
  await writeRecord(COLLECTIONS_STORE, collection);
}

export async function listCollections() {
  const collections = await listRecords(COLLECTIONS_STORE);
  return collections.sort((left, right) => left.createdAt - right.createdAt);
}

export async function deleteCollection(id) {
  const database = await openDatabase();
  const transaction = database.transaction([ASSETS_STORE, COLLECTIONS_STORE], "readwrite");
  const completion = transactionResult(transaction);
  const assetsStore = transaction.objectStore(ASSETS_STORE);
  const collectionsStore = transaction.objectStore(COLLECTIONS_STORE);
  const assetsRequest = assetsStore.getAll();
  assetsRequest.addEventListener("success", () => {
    for (const asset of assetsRequest.result) {
      if (asset.collectionId === id) {
        assetsStore.put({ ...asset, collectionId: null });
      }
    }
    collectionsStore.delete(id);
  }, { once: true });
  await completion;
}
