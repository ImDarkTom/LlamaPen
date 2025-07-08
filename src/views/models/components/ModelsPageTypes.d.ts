type ModelViewInfo =
 | { state: 'data'; model: OllamaModelInfoResponse; isLoaded: boolean }
 | { state: 'loading' }
 | { state: 'error'; message: string }
 | { state: 'unselected' };

type ModelSidebarListItem = {
    model: ModelListItem,
    loadedInMemory: boolean,
};