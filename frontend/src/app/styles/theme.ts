// CoComelon/YouTube Kids-inspired theme
export const cocomelonTheme = {
    colors: {
        // Soft pastels - primary palette
        babyBlue: '#A8D8EA',
        softPink: '#FFB6C1',
        warmYellow: '#FFE66D',
        mintGreen: '#B4E7CE',
        lavender: '#D4C5F9',
        coral: '#FF9A8B',

        // Backgrounds
        cream: '#FFF8F0',
        lightBlue: '#E3F4F4',
        softWhite: '#FFFFFF',

        // Gradients
        skyGradient: 'linear-gradient(135deg, #E3F4F4 0%, #A8D8EA 100%)',
        sunsetGradient: 'linear-gradient(135deg, #FFE66D 0%, #FF9A8B 50%, #FFB6C1 100%)',
        playfulGradient: 'linear-gradient(135deg, #D4C5F9 0%, #FFB6C1 100%)',

        // Functional colors
        success: '#81C784',
        warning: '#FFB74D',
        error: '#EF5350',
        info: '#64B5F6',

        // Text
        darkText: '#5A5A5A',
        lightText: '#8A8A8A',
    },

    borderRadius: {
        small: '12px',
        medium: '20px',
        large: '28px',
        xlarge: '36px',
        round: '50%',
    },

    shadows: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.08)',
        medium: '0 8px 24px rgba(0, 0, 0, 0.12)',
        inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.06)',
    },

    spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
    },

    animations: {
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
};

export type CocomelonTheme = typeof cocomelonTheme;
