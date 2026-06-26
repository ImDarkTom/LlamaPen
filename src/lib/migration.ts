import type { Store } from "pinia";
import logger from "./logger";

type Migrations = (config: Store) => void;

export const migrations: Migrations[] = [
    // v0 -> v1: Move ollamaUrl to ollama.url
    (store) => {
        if ('ollamaUrl' in store) {
            store.$patch((state: any) => {
                state.ollama.url = store.ollamaUrl;
                delete state.ollamaUrl;
            });
        }
    },
];

export function runMigrations(store: Store) {
    const s = store as any;
    const currentVersion: number = s._version ?? 0;
    const targetVersion = migrations.length;
    if (currentVersion >= targetVersion) return;

    for (let i = currentVersion; i < targetVersion; i++) {
        migrations[i]!(store);
    }

    store.$patch({ _version: targetVersion });
    logger.info('Config Migration', `Migrated config from version ${currentVersion} to ${targetVersion} successfully.`);
}