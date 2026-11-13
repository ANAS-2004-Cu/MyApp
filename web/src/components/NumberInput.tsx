import React from 'react';
import { colors, borderRadius } from '../styles/theme';

export interface NumberInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    inputRef?: React.RefObject<HTMLInputElement>;
    onSubmitEditing?: () => void;
}

export default function NumberInput({
    value,
    onChangeText,
    placeholder = 'Enter a number',
    style,
    inputRef,
    onSubmitEditing,
}: NumberInputProps) {
    return (
        <div style={{ ...styles.inputContainer, ...style }}>
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                style={styles.input}
                value={value === '-1' ? '' : value.toString()}
                onChange={(e) => onChangeText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSubmitEditing) {
                        onSubmitEditing();
                    }
                }}
                placeholder={placeholder}
                maxLength={2}
            />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    inputContainer: {
        backgroundColor: colors.lightOverlay,
        borderRadius: borderRadius.medium,
        border: `1px solid ${colors.accent}`,
        overflow: 'hidden',
        width: 150,
    },
    input: {
        color: colors.text,
        backgroundColor: 'transparent',
        border: 'none',
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        fontSize: 18,
        width: '100%',
        textAlign: 'center',
    },
};
