import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { colors, borderRadius, fontSizes } from '../styles/theme';

type ButtonType = 'primary' | 'secondary' | 'outline';

interface StyledButtonProps {
    title: string;
    onPress: () => void;
    type?: ButtonType;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function StyledButton({
    title,
    onPress,
    type = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle
}: StyledButtonProps) {

    const getButtonStyles = () => {
        switch (type) {
            case 'secondary':
                return styles.buttonSecondary;
            case 'outline':
                return styles.buttonOutline;
            default:
                return styles.buttonPrimary;
        }
    };

    const getTextStyles = () => {
        switch (type) {
            case 'outline':
                return styles.textOutline;
            default:
                return styles.text;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyles(),
                disabled && styles.buttonDisabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={type === 'outline' ? colors.primary : colors.text} />
            ) : (
                <Text style={[getTextStyles(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: borderRadius.medium,
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
        borderWidth: 2,
        borderColor: colors.primary,
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
});
