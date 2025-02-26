<script setup lang="ts">
import ModelSelect from './chat/messageInput/ModelSelect.vue';

</script>

<template>
    <div class="w-full h-full flex flex-col p-2 box-border">
        <div class="pl-14 h-14 flex flex-row gap-1 bg-primary-400 mb-2 p-1 rounded-lg box-border">
			<select class="h-full hover:bg-primary-500 p-2 rounded-lg text-txt-2 focus:text-txt-1 cursor-pointer">
				<option value="plaintext">Plaintext</option>
				<option value="html">HTML</option>
				<option value="js">JavaScript</option>
			</select>
			<ModelSelect direction="down" />
		</div>
		<div class="grow box-border">
			<textarea class="size-full dot-bg p-4 box-border resize-none rounded-lg border-[1px] border-txt-2/50 shadow-md shadow-black outline-none focus:border-txt-2
				bg-radial from-txt-2/25 via-primary-500 via-[2px] to-primary-500 bg-[length:2rem_2rem] bg-[position:-1rem_-1rem];"></textarea>
		</div>
    </div>
</template>