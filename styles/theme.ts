// Define a consistent color palette and styling variables for the app

export const colors = {
    primary: '#5D3FD3',       // Purple
    secondary: '#FFD700',     // Gold
    background: '#121212',    // Dark background
    text: '#FFFFFF',          // White text
    accent: '#00E0FF',        // Cyan accent
    success: '#4CAF50',       // Green for success messages
    error: '#F44336',         // Red for errors
    warning: '#FF9800',       // Orange for warnings
    darkOverlay: 'rgba(0,0,0,0.7)',
    lightOverlay: 'rgba(255,255,255,0.05)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const fontSizes = {
    small: 14,
    medium: 18,
    large: 24,
    xlarge: 30,
    xxlarge: 36,
};

export const borderRadius = {
    small: 5,
    medium: 10,
    large: 20,
    round: 999,
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
};
