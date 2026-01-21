import { useModelList, type ModelInfoListItem } from "@/composables/useModelList";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useConfigStore } from "./config";
import type { Model, ModelCapabilities } from "@/providers/base/types";

export const useModelSelect = defineStore('modelSelect', () => {
    const { getModelCapabilities } = useModelList();
    const config = useConfigStore();
    // const userStore = useUserStore();

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

    const queriedModelList = computed<ModelInfoListItem[]>(() => {
        return useModelList().models.value
            .filter((model) => {
                const query = (searchQuery.value || "").toLowerCase();

                return (
                    model.modelData.name.toLowerCase().includes(query) ||
                    model.displayName.toLowerCase().includes(query) ||
                    model.modelData.id.toLowerCase().includes(query)
                );
            });
    });

    function userSort(items: ModelInfoListItem[]) {
        const favoriteModels = config.models.favoriteModels ?? [];
        const favorites: ModelInfoListItem[] = [];
        const nonFavorites: ModelInfoListItem[] = [];

        const filter = filterCapabilities.value;
        const filteredItems = items.filter(model => {
            const capabilities = getModelCapabilities(model);

            return (Object.keys(filter) as Array<keyof ModelCapabilities>).every(key => {
                return !filter[key] || capabilities[key];
            });
        });

        filteredItems.forEach(item => {
            if (favoriteModels.includes(item.modelData.id)) {
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
                    const item1 = a.modelData.id.split('/')[1] ?? a.modelData.id;
                    const item2 = b.modelData.id.split('/')[1] ?? b.modelData.id;
                    return item1.localeCompare(item2, undefined, { sensitivity: 'base' });
                });
                break;
            // TODO(ollama): some way to allow custom sorting/filtering based on provider (size sort)
            // case 'size':
            //     nonFavorites.sort((a, b) => a.modelData.size - b.modelData.size);
            //     break;
        }

        if (direction.value === 'des') {
            nonFavorites.reverse();
            favorites.reverse();
        }

        return [...favorites, ...nonFavorites];
    }

    function sortItems(items: ModelInfoListItem[]) {
        items = userSort(items) || items;

        // TODO(llamapen-cloud): sorting item based on provider-specific properties
        // if (config.cloud.enabled) {
        //     if (!userStore.isPremium) {
        //         items.sort((a, b) => {
        //             return (a.modelData.llamapenMetadata?.premium ? 1 : 0) - (b.modelData.llamapenMetadata?.premium ? 1 : 0)
        //         });
        //     }

        //     if (userStore.userInfo.options.showProprietaryModels === false) {
        //         items = items.filter(item => !item.modelData.llamapenMetadata?.tags?.includes('closedSource'));
        //     }
        // }

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