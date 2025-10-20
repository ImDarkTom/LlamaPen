import { nextTick, ref, watch, type Ref } from "vue";

interface FloatingMenuOptions {
    isOpened: Ref<boolean>;
    buttonRef: Ref<HTMLElement | null>;
    menuRef: Ref<HTMLElement | null>;
    prefferedPosition?: 'top' | 'bottom';
    anchored?: 'left' | 'center' | 'right';
    paddingPx?: number;
}

export function useFloatingMenu({
    isOpened,
    buttonRef,
    menuRef,
    prefferedPosition = 'bottom',
    anchored = 'left',
    paddingPx = 0,
}: FloatingMenuOptions) {
    const menuPosition = ref<{ top?: string, bottom?: string, left?: string }>({});

    const computePosition = () => {
        if (
            !isOpened.value || 
            !buttonRef.value || 
            !menuRef.value
        ) return { top: '0px', left: '0px' };
        
        const buttonRect = buttonRef.value.getBoundingClientRect();
        const menuHeight = menuRef.value.offsetHeight;
        const menuWidth = menuRef.value.offsetWidth;

        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        const shouldShowAbove = 
            (menuHeight > spaceBelow && spaceAbove >= menuHeight) ||
            (prefferedPosition === 'top' && spaceAbove >= menuHeight);
        const vertical  = shouldShowAbove
            ? { bottom: `${window.innerHeight - buttonRect.top - window.scrollY + paddingPx}px` }
            : { top: `${buttonRect.bottom + window.scrollY + paddingPx}px` };

        let left: number;
        if (anchored === 'left') {
            left = buttonRect.left + window.scrollX;
        } else if (anchored === 'right') {
            left = buttonRect.right - menuWidth + window.scrollX;
        } else { // center
            const buttonCenter = buttonRect.left + buttonRect.width / 2 + window.scrollX;
            left = buttonCenter - (menuWidth / 2);
        }

        left = Math.max(0, Math.min(left, window.innerWidth - menuWidth));

        return { ...vertical, left: `${left}px` };
    };

    const recomputePosition = async () => {
        await nextTick();
        menuPosition.value = computePosition();
    }

    watch(isOpened, () => recomputePosition(), { immediate: true });

    return { menuPosition, recomputePosition };
}