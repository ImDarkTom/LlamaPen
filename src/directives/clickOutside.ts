import type { Directive } from "vue";

// based off https://stackoverflow.com/a/76281017
const clickOutside: Directive = {
    beforeMount: (element, binding) => {
        element.clickOutsideEvent = function (event: MouseEvent) {
            if (!(element === event.target || element.contains(event.target))) {
                binding.value(event);
            }
        };

        document.body.addEventListener('click', element.clickOutsideEvent);
    },
    unmounted: (element) => {
        document.body.removeEventListener('click', element.clickOutsideEvent);
    }
};

export default clickOutside;