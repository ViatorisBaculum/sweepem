import { Capacitor } from '@capacitor/core';

/**
 * Detect if running in a Capacitor environment
 * @returns boolean indicating if Capacitor is available and running in native platform
 */
export function isCapacitorEnvironment(): boolean {
    try {
        return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
    } catch (e) {
        return false;
    }
}

/**
 * Get status bar height approximation
 * Note: This is a simplified approach using CSS environment variables and screen dimensions
 * For more precise control, the StatusBar plugin would be needed
 * @returns Promise<number> status bar height in pixels
 */
export async function getStatusBarHeight(): Promise<number> {
    // If we're not in a Capacitor environment, return 0
    if (!isCapacitorEnvironment()) {
        return 0;
    }

    // Try to get the status bar height from CSS environment variables
    if (typeof window !== 'undefined' && window.CSS?.supports) {
        // Check if env() is supported
        if (window.CSS.supports('padding-top: env(safe-area-inset-top)')) {
            // Try to get the value from a temporary element
            const tempElement = document.createElement('div');
            tempElement.style.paddingTop = 'env(safe-area-inset-top)';
            document.body.appendChild(tempElement);

            const computedStyle = window.getComputedStyle(tempElement);
            const paddingTop = computedStyle.getPropertyValue('padding-top');

            document.body.removeChild(tempElement);

            if (paddingTop) {
                const height = parseInt(paddingTop, 10);
                if (!isNaN(height) && height > 0) {
                    return height;
                }
            }
        }
    }

    // Fallback to estimation based on screen dimensions
    // Most Android status bars are around 24-30dp, iOS is around 20pt
    // We'll estimate based on device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    const estimatedHeight = Math.round(25 * devicePixelRatio);

    return estimatedHeight;
}

/**
 * Adjust modal padding for status bar
 * @param modalElement The modal element to adjust
 * @returns Promise<void>
 */
export async function adjustModalPaddingForStatusBar(modalElement: HTMLElement): Promise<void> {
    if (!isCapacitorEnvironment()) {
        return;
    }

    try {
        const statusBarHeight = await getStatusBarHeight();
        // Add 1rem (16px) to the status bar height
        const additionalPadding = statusBarHeight + 16; // 1rem = 16px

        // Apply the padding to the modal element
        modalElement.style.paddingTop = `${additionalPadding}px`;
    } catch (error) {
        console.warn('Error adjusting modal padding for status bar:', error);
        // Fallback to default padding
        modalElement.style.paddingTop = '1rem';
    }
}