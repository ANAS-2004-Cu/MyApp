import React from 'react';
import { colors, borderRadius, fontSizes } from '../styles/theme';

export type ButtonType = 'primary' | 'secondary' | 'outline';

export interface StyledButtonProps {
    title: string;
    onPress: () => void;
    type?: ButtonType;
    disabled?: boolean;
    loading?: boolean;
    style?: React.CSSProperties;
    textStyle?: React.CSSProperties;
}

export default function StyledButton({
    title,
    onPress,
    type = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
}: StyledButtonProps) {
    const getButtonStyles = (): React.CSSProperties => {
        switch (type) {
            case 'secondary':
                return styles.buttonSecondary;
            case 'outline':
                return styles.buttonOutline;
            default:
                return styles.buttonPrimary;
        }
    };

    const getTextStyles = (): React.CSSProperties => {
        switch (type) {
            case 'outline':
                return styles.textOutline;
            default:
                return styles.text;
        }
    };

    return (
        <button
            type="button"
            style={{
                ...styles.button,
                ...getButtonStyles(),
                ...(disabled ? styles.buttonDisabled : {}),
                ...style,
            }}
            onClick={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <div
                    className="spinner"
                    style={{
                        width: 20,
                        height: 20,
                        borderTopColor: type === 'outline' ? colors.primary : colors.text,
                    }}
                />
            ) : (
                <span style={{ ...getTextStyles(), ...textStyle }}>{title}</span>
            )}
        </button>
    );
}

const styles: Record<string, React.CSSProperties> = {
    button: {
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: borderRadius.medium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        border: `2px solid ${colors.primary}`,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    text: {
        color: colors.text,
        fontSize: fontSizes.medium,
        fontWeight: 'bold',
    },
    textOutline: {
        color: colors.primary,
        fontSize: fontSizes.medium,
        fontWeight: 'bold',
    },
};
