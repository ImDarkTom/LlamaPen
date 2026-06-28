import type { LLMProvider, MemoryManagedProvider } from "../base/ProviderInterface";

export const isMemoryManagedProvider = (provider: LLMProvider): provider is MemoryManagedProvider => 
    provider.capabilities.memoryManagement;
