<script setup lang="ts">
import type { AccountSettings } from '@/stores/user';
import useUserStore from '@/stores/user';
import { reactive, ref } from 'vue';

const userStore = useUserStore();

const form = reactive<AccountSettings>({
    providerSelection: 'all',
});

const saveBtnText = ref('Save');
const isSaving = ref(false);

async function updateOptions() {
    saveBtnText.value = "Saving...";
    isSaving.value = true;

    const { success, message } = await userStore.updateAccountSettings(form);

    isSaving.value = false;
    if (success) {
        saveBtnText.value = 'Saved!';
        setTimeout(() => {
            saveBtnText.value = 'Save';
        }, 1000);
    } else {
        alert(`Error saving account info: ${message}`);
        saveBtnText.value = "Save";
    }
}

</script>

<template>
    <div class="flex flex-col">
        <form @submit.prevent="updateOptions">
            <div class="mb-2">
                <label>
                    <span>Model providers</span>
                    <select 
                        v-model="form.providerSelection"
                        class="bg-surface p-2 rounded-md ring-1 ring-border-muted focus:ring-border w-full overflow-hidden text-ellipsis">
                        <option value="all">Any - use any provider for generation</option>
                        <option value="no_training">No training - do not use providers that train on prompts</option>
                        <option value="no_retention">No retention - do not use providers that store any persistent data</option>
                    </select>
                </label>
            </div>
            <button type="submit" class="btn-primary p-2 disabled:opacity-75" :disabled="isSaving">{{ saveBtnText }}</button>
        </form>
    </div>
</template>