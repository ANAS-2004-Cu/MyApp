import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, borderRadius } from '../styles/theme';

interface ProgressBarProps {
    current: number;
    max: number;
    label?: string;
}

export default function ProgressBar({
    current,
    max,
    label
}: ProgressBarProps) {
    const percentage = Math.max(0, Math.min(100, ((max - current) / max) * 100));

    // Determine color based on remaining progress
    const getColor = () => {
        if (percentage > 60) return colors.success;
        if (percentage > 30) return colors.warning;
        return colors.error;
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.progressBackground}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${percentage}%`, backgroundColor: getColor() }
                    ]}
                />
            </View>
            <Text style={styles.remainingText}>{max - current} of {max} attempts remaining</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
    },
    label: {
        color: colors.text,
        marginBottom: 4,
        fontSize: 14,
    },
    progressBackground: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: borderRadius.round,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.round,
    },
    remainingText: {
        color: colors.text,
        marginTop: 4,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '600',
    }
});
