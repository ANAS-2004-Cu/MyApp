import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import * as Clipboard from 'expo-clipboard';
import * as GuerrillaAPI from '../utils/tempMailService';

export default function GuerrillaEmailDetail() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<any>(null);
    const { width } = useWindowDimensions();

    // Fetch email details on component mount
    useEffect(() => {
        fetchEmailDetails();
    }, [id]);

    // Fetch email details from API
    const fetchEmailDetails = async () => {
        if (!id || typeof id !== 'string') {
            Alert.alert('Error', 'Invalid email ID');
            router.back();
            return;
        }

        try {
            setLoading(true);
            const emailData = await GuerrillaAPI.fetchEmail(id);
            setEmail(emailData);
        } catch (error) {
            console.error('Error fetching email details:', error);
            Alert.alert('Error', 'Failed to load email details. Please try again.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Copy text to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            Alert.alert('Success', 'Text copied to clipboard');
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    };

    // If loading, show loading indicator
    if (loading) {
        return (
            <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#78F0BC" />
                    <Text style={styles.loadingText}>Loading email...</Text>
                </View>
            </ImageBackground>
        );
    }

    // If no email data, show error
    if (!email) {
        return (
            <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={60} color="#FF6B6B" />
                    <Text style={styles.errorText}>Failed to load email</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    // Extract display name and email address
    let displayName = email.mail_from;
    let emailAddress = '';
    const matches = email.mail_from.match(/(.*)\s<(.*)>/);
    if (matches && matches.length > 2) {
        displayName = matches[1];
        emailAddress = matches[2];
    }

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {email.mail_subject || '(No subject)'}
                    </Text>
                    <View style={{ width: 32 }} />
                </View>

                <ScrollView style={styles.scrollContainer}>
                    {/* Email metadata */}
                    <View style={styles.emailMetadata}>
                        <View style={styles.senderRow}>
                            <View style={styles.senderIcon}>
                                <Text style={styles.senderInitial}>
                                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <View style={styles.senderInfo}>
                                <Text style={styles.senderName}>{displayName || 'Unknown'}</Text>
                                <Text style={styles.senderAddress}>{emailAddress || email.mail_from}</Text>
                            </View>
                        </View>

                        <Text style={styles.dateText}>
                            {formatDate(email.mail_timestamp)}
                        </Text>
                    </View>

                    {/* Email content */}
                    <View style={styles.emailContent}>
                        <RenderHtml
                            contentWidth={width - 32}
                            source={{ html: email.mail_body || '<p>No content available</p>' }}
                            baseStyle={styles.htmlContent}
                            tagsStyles={{
                                body: { color: '#fff', fontFamily: 'System' },
                                a: { color: '#78F0BC', textDecorationLine: 'underline' },
                                p: { color: '#fff', marginBottom: 10 },
                                div: { color: '#fff', marginBottom: 10 },
                                span: { color: '#fff' },
                                h1: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
                                h2: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
                                h3: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 6 },
                                ul: { color: '#fff', marginLeft: 20 },
                                ol: { color: '#fff', marginLeft: 20 },
                                li: { color: '#fff', marginBottom: 5 },
                                table: { borderColor: '#78F0BC', borderWidth: 1 },
                                th: { backgroundColor: 'rgba(120, 240, 188, 0.2)', padding: 5 },
                                td: { padding: 5, borderColor: '#78F0BC', borderWidth: 0.5 },
                                img: { maxWidth: width - 50 }
                            }}
                            renderersProps={{
                                a: {
                                    onPress: (_, href) => {
                                        Linking.openURL(href);
                                    },
                                },
                            }}
                            defaultTextProps={{
                                selectable: true,
                            }}
                            enableExperimentalMarginCollapsing={true}
                        />
                    </View>

                    {/* Copy button for easier access */}
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => copyToClipboard(email.mail_body?.replace(/<[^>]*>/g, ' ') || '')}
                    >
                        <MaterialIcons name="content-copy" size={20} color="#78F0BC" />
                        <Text style={styles.copyButtonText}>Copy Content</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        height: 60,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    scrollContainer: {
        flex: 1,
    },
    emailMetadata: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(120, 240, 188, 0.2)',
    },
    senderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    senderIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(120, 240, 188, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    senderInitial: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#78F0BC',
    },
    senderInfo: {
        flex: 1,
    },
    senderName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    senderAddress: {
        fontSize: 14,
        color: '#ccc',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    emailContent: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        margin: 10,
    },
    htmlContent: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'System',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#fff',
        marginVertical: 20,
    },
    backButtonText: {
        color: '#78F0BC',
        fontSize: 16,
        padding: 10,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 10,
    },
    copyButtonText: {
        color: '#78F0BC',
        marginLeft: 8,
        fontSize: 14,
    },
});
