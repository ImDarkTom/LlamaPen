import type { Store } from "pinia";
import logger from "./logger";
import { useCustomProvidersStore } from "@/stores/useCustomProvidersStore";

type Migrations = (config: Store) => void;

export const migrations: Migrations[] = [
    // v0 -> v1: Move ollamaUrl to ollama.url
    (store) => {
        store.$patch((state: any) => {
            state.ollama.url = state.ollamaUrl;
            delete state.ollamaUrl;
        });
    },

    // v1 -> v2: Remove LlamaPen Cloud config and auth leftovers
    (store) => {
        store.$patch((state: any) => {
            delete state.cloud;
            delete state.developer;

            if (state.models) {
                delete state.models.favoriteCloudModels;
            }
        });

        localStorage.removeItem('sb-iclfocxwzrkekqubcjvo-auth-token');
    },

    // v2 -> v3: Move Ollama into providers store
    (store) => {
        store.$patch((state: any) => {
            useCustomProvidersStore().seedDefaultProvider({
                name: 'Ollama',
                apiKey: 'ollama',
                format: 'ollama',
                baseURL: state.ollama.url,
                seededDefault: true,
            });

            state.provider.ollama = {
                autoloadCapabilities: state.ollama.modelCapabilities.autoload,
                alwaysAutoloadCapabilities: state.ollama.modelCapabilities.alwaysAutoload,
            };

            delete state.ollama;
        });
    }
];

function getPersistedConfigVersion(): number | null {
    const raw = localStorage.getItem('config');

    if (!raw) return null; // Fresh install

    try {
        const parsed = JSON.parse(raw);

        if (typeof parsed._version !== 'number') return 0; // Config but no _version means v0

        return parsed._version;
    } catch {
        return null;
    }
}

export function runMigrations(store: Store): boolean {
    const s = store as any;
    const persistedVersion = getPersistedConfigVersion();

    const currentVersion: number = persistedVersion ?? s._version ?? 0;
    const targetVersion = migrations.length;

    if (currentVersion >= targetVersion) return false;

    for (let i = currentVersion; i < targetVersion; i++) {
        migrations[i]!(store);
    }

    store.$patch({ _version: targetVersion });
    logger.info('Config Migration', `Migrated config from version ${currentVersion} to ${targetVersion} successfully.`);
    return true;
}