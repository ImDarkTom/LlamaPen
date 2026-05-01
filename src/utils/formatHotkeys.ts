export function formatHotkeys(hotkey: Hotkey, platform: 'win' | 'mac') {
    const result: string[] = [];

    if (platform === 'mac') {
        if (hotkey.ctrl) result.push('⌃');
        if (hotkey.alt) result.push('⌥');
        if (hotkey.shift) result.push('⇧');
    } else {
        if (hotkey.ctrl) result.push('Ctrl');
        if (hotkey.alt) result.push('Alt');
        if (hotkey.shift) result.push('⇧');
    }

    result.push(hotkey.key.toUpperCase());
    return result;
}