import { useModelList, type ModelInfoListItem } from "@/composables/useModelList";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useConfigStore } from "./config";
import type { Model } from "@/providers/base/types";

export const useModelSelect = defineStore('modelSelect', () => {
    // const { getModelCapabilities } = useModelList();
    const config = useConfigStore();
    // const userStore = useUserStore();

    const searchQuery = ref('');
    const isMenuOpened = ref(false);
    const focusedItemIndex = ref(0);

    const filterMenuOpen = ref(false);
    const orderBy = ref<'default' | 'alphabetically' | 'size'>('default');
    // TODO(next): this up next, so we can finnally remove all custom ollama typings
    const filterCapabilities = ref<OllamaCapability[]>([]);
    const direction = ref<'asc' | 'des'>('asc');

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
        // TODO(critical): make filtering capabilities work 
        // if (filterCapabilities.value.length > 0) {
            
        //     items = items.filter((item) => {
        //         const capabilities = getModelCapabilities(item);
        //         return capabilities && filterCapabilities.value.every((cap) => capabilities.[cap]);
        //     });
        // }

        const favoriteModels = config.models.favoriteModels ?? [];
        const favorites: ModelInfoListItem[] = [];
        const nonFavorites: ModelInfoListItem[] = [];

        items.forEach(item => {
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
        resetState
    }
});