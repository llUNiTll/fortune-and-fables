const STORAGE_PREFIX = 'ledger-legends-';

type LocalBackup = {
  app: 'Fortune & Fables';
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
};

export function createLocalBackup(storage: Storage): LocalBackup {
  const data: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = storage.getItem(key);
      if (value !== null) data[key] = value;
    }
  }
  return {
    app: 'Fortune & Fables',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadLocalBackup(storage: Storage) {
  const backup = createLocalBackup(storage);
  const date = backup.exportedAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fortune-and-fables-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function restoreLocalBackup(storage: Storage, raw: string) {
  const backup = JSON.parse(raw) as Partial<LocalBackup>;
  if (
    backup.app !== 'Fortune & Fables' ||
    backup.version !== 1 ||
    !backup.data ||
    typeof backup.data !== 'object' ||
    Array.isArray(backup.data)
  ) {
    throw new Error('This is not a valid Fortune & Fables backup.');
  }

  const entries = Object.entries(backup.data);
  if (
    entries.some(
      ([key, value]) =>
        !key.startsWith(STORAGE_PREFIX) || typeof value !== 'string',
    )
  ) {
    throw new Error('This backup contains invalid save data.');
  }

  Object.keys(storage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => storage.removeItem(key));
  entries.forEach(([key, value]) => storage.setItem(key, value));
  storage.setItem('ledger-legends-fresh-v1', 'done');
}

