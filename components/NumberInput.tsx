import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ViewStyle
} from 'react-native';
import { colors, borderRadius } from '../styles/theme';

interface NumberInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: ViewStyle;
    inputRef?: React.RefObject<TextInput>;
}

export default function NumberInput({
    value,
    onChangeText,
    placeholder = "Enter a number",
    style,
    inputRef
}: NumberInputProps) {
    return (
        <View style={[styles.inputContainer, style]}>
            <TextInput
                style={styles.input}
                value={value === '-1' ? '' : value.toString()}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                ref={inputRef}
                maxLength={2}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        backgroundColor: colors.lightOverlay,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        borderColor: colors.accent,
        overflow: 'hidden',
        width: 150,
    },
    input: {
        color: colors.text,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        width: '100%',
        textAlign: 'center',
    },
});
