import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useConfigStore } from "./config";
import type { Model, ModelCapabilities, ProviderMetadata } from "@/providers/base/types";
import { useProviderManager, type ModelInfo } from "@/composables/useProviderManager";
import useUserStore from "./user";

export const useModelSelect = defineStore('modelSelect', () => {
    const { getModelCapabilities, currentProviderId } = useProviderManager();
    const config = useConfigStore();
    const userStore = useUserStore();

    const searchQuery = ref('');
    const isMenuOpened = ref(false);
    const focusedItemIndex = ref(0);

    const filterMenuOpen = ref(false);
    const orderBy = ref<'default' | 'alphabetically' | 'size'>('default');
    const direction = ref<'asc' | 'des'>('asc');
    const filterCapabilities = ref<ModelCapabilities>({
        supportsFunctionCalling: false,
        supportsReasoning: false,
        supportsVision: false,
    });

    const queriedModelList = computed<ModelInfo[]>(() => {
        return useProviderManager().rawModels.value
            .filter((model) => {
                const query = (searchQuery.value || "").toLowerCase();

                return (
                    model.info.name.toLowerCase().includes(query) ||
                    model.displayName.toLowerCase().includes(query) ||
                    model.info.id.toLowerCase().includes(query)
                );
            });
    });

    function userSort(items: ModelInfo[]) {
        const favoriteModels = config.models.favoriteModels ?? [];
        const favorites: ModelInfo[] = [];
        const nonFavorites: ModelInfo[] = [];

        const filter = filterCapabilities.value;
        const filteredItems = items.filter(model => {
            const capabilities = getModelCapabilities(model.info.id);

            return (Object.keys(filter) as Array<keyof ModelCapabilities>).every(key => {
                return !filter[key] || capabilities[key];
            });
        });

        filteredItems.forEach(item => {
            if (favoriteModels.includes(item.info.id)) {
                favorites.push(item);
            } else {
                nonFavorites.push(item);
            }
        });

        switch (orderBy.value) {
            case 'default':
                break;
            case 'alphabetically':
                nonFavorites.sort((a, b) => {
                    const item1 = a.info.id.split('/')[1] ?? a.info.id;
                    const item2 = b.info.id.split('/')[1] ?? b.info.id;
                    return item1.localeCompare(item2, undefined, { sensitivity: 'base' });
                });
                break;
            case 'size':
                nonFavorites.sort((a, b) => {
                    if (a.info.providerMetadata?.provider !== 'ollama' || b.info.providerMetadata?.provider !== 'ollama') return 0;
                    return a.info.providerMetadata.data.size - b.info.providerMetadata.data.size
                });
                break;
        }

        if (direction.value === 'des') {
            nonFavorites.reverse();
            favorites.reverse();
        }

        return [...favorites, ...nonFavorites];
    }

    function sortItems(items: ModelInfo[]) {
        items = userSort(items) || items;

        if (currentProviderId.value === 'lpcloud') {
            if (!userStore.isPremium) {
                items.sort((a, b) => {
                    return ((a.info.providerMetadata as (ProviderMetadata & { provider: 'lpcloud' })).data.premium ? 1 : 0) - ((b.info.providerMetadata as (ProviderMetadata & { provider: 'lpcloud' })).data.premium ? 1 : 0)
                });
            }

            if (userStore.userInfo.options.showProprietaryModels === false) {
                items = items.filter(item => !((item.info.providerMetadata as (ProviderMetadata & { provider: 'lpcloud' })).data.tags?.includes('closedSource')));
            }
        }

        return items;
    }

    async function setModel(newModel: Model, skipUiUpdate: boolean = false) {
        const newModelId = newModel.id;
        config.selectedModel = newModelId;

        if (!skipUiUpdate) {
            isMenuOpened.value = false;
            searchQuery.value = "";
        };
    }

    function resetState() {
        isMenuOpened.value = false;
        searchQuery.value = "";
        focusedItemIndex.value = 0;
    }

    const sortedItems = computed(() => sortItems(queriedModelList.value.filter((item) => !item.hidden)));

    function resetFilters() {
        filterCapabilities.value = {
            supportsFunctionCalling: false,
            supportsReasoning: false,
            supportsVision: false,
        };

        orderBy.value = 'default';
        direction.value = 'asc';
    }

    return {
        isMenuOpened,
        searchQuery,
        focusedItemIndex,
        queriedModelList,
        filterMenuOpen,
        orderBy,
        filterCapabilities,
        direction,
        sortedItems,
        sortItems,
        setModel,
        resetState,
        resetFilters,
    }
});