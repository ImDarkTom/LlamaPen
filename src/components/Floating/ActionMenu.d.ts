type TextResolver<T> = T extends void 
    ? string | (() => string)
    : string | ((args: T) => string);

type IconResolver<T> = T extends void
    ? IconType | { type: 'factory'; func: () => IconType }
    : IconType | { type: 'factory'; func: (args: T) => IconType };

type OnClickHandler<T> = T extends void
    ? () => void
    : (args: T) => void;

type MenuEntry<T = void> = {
    type: 'text',
    text: TextResolver<T>,
    onClick: OnClickHandler<T>,
    icon?: IconResolver<T>,
    category?: 'general' | 'danger',
    condition?: boolean,
} | {
    type: 'divider',
    condition?: boolean,
};