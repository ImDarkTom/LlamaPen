import type { Directive } from "vue";

// https://stackoverflow.com/a/76281017
const mousedownOutside: Directive = {
    beforeMount: (element, binding) => {
        element.mousedownOutsideEvent = function (event: MouseEvent) {
            if (!(element === event.target || element.contains(event.target))) {
                binding.value(event);
            }
        };

        document.body.addEventListener('mousedown', element.mousedownOutsideEvent);
    },
    unmounted: (element) => {
        document.body.removeEventListener('mousedown', element.mousedownOutsideEvent);
    }
};

export default mousedownOutside;