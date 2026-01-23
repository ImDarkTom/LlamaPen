import type { Model } from "@/providers/base/types";

export type ModelInfo = {
    info: Model;
    displayName: string;
    loadedInMemory: boolean;
    hidden: boolean;
}