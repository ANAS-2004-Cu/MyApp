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
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { getMessage, deleteMessage } from '../utils/tempMailService';
import * as GuerrillaAPI from '../utils/tempMailService';
import * as SecureStore from 'expo-secure-store';

export default function EmailDetail() {
    const { id, provider } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<any>(null);
    const [htmlContent, setHtmlContent] = useState('');
    const [plainTextContent, setPlainTextContent] = useState('');
    const [showHtml, setShowHtml] = useState(true);
    const { width } = useWindowDimensions();

    const isMailGw = provider === 'mailgw';

    // Ensure we have a valid email ID
    useEffect(() => {
        if (!id || typeof id !== 'string') {
            Alert.alert('Error', 'Invalid email ID');
            router.back();
            return;
        }

        fetchEmailDetails();
    }, [id, provider]);

    // Fetch email details based on provider
    const fetchEmailDetails = async () => {
        try {
            setLoading(true);

            if (isMailGw) {
                // Fetch from Mail.GW API
                const emailData = await getMessage(id as string);
                setEmail(emailData);

                // Set content
                const html = emailData.html || `<div>${emailData.text || 'No content available'}</div>`;
                const text = emailData.text || 'No content available';

                setHtmlContent(html);
                setPlainTextContent(text);
            } else {
                // For GuerrillaMail
                await initializeGuerrillaAPI();
                const emailData = await GuerrillaAPI.fetchEmail(id as string);

                if (!emailData) {
                    throw new Error('Failed to fetch email data');
                }

                setEmail(emailData);

                // Extract the content
                const html = emailData.mail_body || `<div>${emailData.mail_excerpt || 'No content available'}</div>`;
                // Remove HTML tags for plain text
                const text = emailData.mail_body ?
                    emailData.mail_body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() :
                    (emailData.mail_excerpt || 'No content available');

                setHtmlContent(html);
                setPlainTextContent(text);
            }
        } catch (error) {
            console.error('Error fetching email details:', error);
            Alert.alert('Error', 'Failed to load email details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initialize GuerrillaMail API with stored token
    const initializeGuerrillaAPI = async () => {
        try {
            const storedGuerrilla = await SecureStore.getItemAsync('guerrilla_data');
            if (storedGuerrilla) {
                const data = JSON.parse(storedGuerrilla);
                GuerrillaAPI.initializeFromStoredData({
                    sid_token: data.sid_token,
                    email_user: data.email_user
                });
            } else {
                throw new Error('No stored GuerrillaMail session found');
            }
        } catch (error) {
            console.error('Error initializing GuerrillaMail API:', error);
            throw error;
        }
    };

    // Handle delete email
    const handleDeleteEmail = async () => {
        if (!email) return;

        Alert.alert(
            'Delete Email',
            'Are you sure you want to delete this email?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (isMailGw) {
                                await deleteMessage(email.id);
                                Alert.alert('Success', 'Email deleted successfully');
                            } else {
                                // For GuerrillaMail - just handle locally since API doesn't support deletion
                                Alert.alert('Success', 'Email removed from view');
                            }
                            router.back();
                        } catch (error) {
                            console.error('Error deleting email:', error);
                            Alert.alert('Error', 'Failed to delete email. Please try again.');
                        }
                    },
                },
            ],
        );
    };

    // Format date for display
    const formatDate = (dateValue: string | number) => {
        if (!dateValue) return '';

        let date;
        if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        } else {
            date = new Date(dateValue * 1000);
        }

        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Copy content to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            Alert.alert('Success', 'Content copied to clipboard');
        } catch (error) {
            console.error('Failed to copy text:', error);
            Alert.alert('Error', 'Failed to copy text to clipboard');
        }
    };

    // Toggle between HTML and plain text
    const toggleContentView = () => {
        setShowHtml(!showHtml);
    };

    // If loading, show indicator
    if (loading) {
        return (
            <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Loading email...</Text>
                        <View style={{ width: 30 }} />
                    </View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#78F0BC" />
                        <Text style={styles.loadingText}>Loading email content...</Text>
                    </View>
                </View>
            </ImageBackground>
        );
    }

    // If email failed to load
    if (!email) {
        return (
            <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Error</Text>
                        <View style={{ width: 30 }} />
                    </View>
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={60} color="#FF6B6B" />
                        <Text style={styles.errorText}>Failed to load email</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchEmailDetails}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        );
    }

    // Extract data based on provider
    const emailSubject = isMailGw ? email.subject : email.mail_subject;
    const fromName = isMailGw ? (email.from?.name || 'Unknown') :
        (email.mail_from?.match(/(.*)\s<(.*)>/) ? email.mail_from.match(/(.*)\s<(.*)>/)[1] : email.mail_from);
    const fromEmail = isMailGw ? email.from?.address :
        (email.mail_from?.match(/(.*)\s<(.*)>/) ? email.mail_from.match(/(.*)\s<(.*)>/)[2] : email.mail_from);
    const dateDisplay = formatDate(isMailGw ? email.createdAt : email.mail_timestamp);

    // Set up HTML wrapper for WebView
    const htmlWrapper = `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        color: white;
                        background-color: transparent;
                        padding: 10px;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    a { color: #78F0BC; }
                    img { max-width: 100%; height: auto; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #555; padding: 8px; }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
        </html>
    `;

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {emailSubject || '(No subject)'}
                    </Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEmail}>
                        <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    {/* Email metadata */}
                    <View style={styles.emailMetadata}>
                        <View style={styles.senderRow}>
                            <View style={styles.senderIcon}>
                                <Text style={styles.senderInitial}>
                                    {(fromName?.charAt(0) || '?').toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.senderInfo}>
                                <Text style={styles.senderName}>{fromName || 'Unknown'}</Text>
                                <Text style={styles.senderAddress}>{fromEmail || ''}</Text>
                            </View>
                        </View>

                        {isMailGw && email.to && (
                            <View style={styles.recipientContainer}>
                                <Text style={styles.recipientLabel}>To: </Text>
                                <Text style={styles.recipientAddress}>
                                    {Array.isArray(email.to) ?
                                        email.to.map((recipient: any) => recipient.address).join(', ') :
                                        ''}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.dateText}>{dateDisplay}</Text>
                    </View>

                    {/* Toggle button */}
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleContentView}>
                        <Text style={styles.toggleButtonText}>
                            View {showHtml ? 'Plain Text' : 'HTML'}
                        </Text>
                    </TouchableOpacity>

                    {/* Email content */}
                    <View style={styles.emailContent}>
                        {showHtml ? (
                            // HTML content in WebView
                            <WebView
                                style={styles.webView}
                                originWhitelist={['*']}
                                source={{ html: htmlWrapper }}
                                scrollEnabled={true}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View style={styles.webviewLoading}>
                                        <ActivityIndicator size="small" color="#78F0BC" />
                                    </View>
                                )}
                                onNavigationStateChange={(event) => {
                                    // Handle external URLs
                                    if (event.url !== 'about:blank' && event.navigationType === 'click') {
                                        Linking.openURL(event.url);
                                        return false;
                                    }
                                }}
                                onError={(syntheticEvent) => {
                                    const { nativeEvent } = syntheticEvent;
                                    console.error('WebView error:', nativeEvent);
                                    setShowHtml(false); // Fall back to plain text on error
                                }}
                                backgroundColor="transparent"
                            />
                        ) : (
                            // Plain text content
                            <ScrollView style={styles.plainTextScroll}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onLongPress={() => copyToClipboard(plainTextContent)}
                                >
                                    <Text style={styles.plainTextContent} selectable={true}>
                                        {plainTextContent || 'No content available'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>

                    {/* Copy button */}
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => copyToClipboard(plainTextContent)}
                    >
                        <MaterialIcons name="content-copy" size={20} color="#78F0BC" />
                        <Text style={styles.copyButtonText}>Copy Content</Text>
                    </TouchableOpacity>

                    {/* Attachments (Mail.GW only) */}
                    {isMailGw && email.hasAttachments && email.attachments && email.attachments.length > 0 && (
                        <View style={styles.attachmentsContainer}>
                            <Text style={styles.attachmentsTitle}>
                                Attachments ({email.attachments.length})
                            </Text>
                            {email.attachments.map((attachment: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.attachmentItem}
                                    onPress={async () => {
                                        try {
                                            const fileUri = FileSystem.documentDirectory + attachment.filename;
                                            const downloadResumable = FileSystem.createDownloadResumable(
                                                attachment.downloadUrl,
                                                fileUri
                                            );
                                            const result = await downloadResumable.downloadAsync();
                                            if (result && result.uri) {
                                                await Sharing.shareAsync(result.uri);
                                            }
                                        } catch (error) {
                                            console.error('Error downloading attachment:', error);
                                            Alert.alert('Error', 'Failed to download attachment');
                                        }
                                    }}
                                >
                                    <MaterialIcons name="attachment" size={20} color="#78F0BC" />
                                    <View style={styles.attachmentDetails}>
                                        <Text style={styles.attachmentName} numberOfLines={1}>
                                            {attachment.filename || 'Attachment'}
                                        </Text>
                                        <Text style={styles.attachmentSize}>
                                            {attachment.size ? `${(attachment.size / 1024).toFixed(0)} KB` : ''}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="download" size={20} color="#78F0BC" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
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
    deleteButton: {
        padding: 5,
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
    recipientContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    recipientLabel: {
        fontSize: 14,
        color: '#999',
    },
    recipientAddress: {
        fontSize: 14,
        color: '#ccc',
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    toggleButton: {
        alignSelf: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 16,
        backgroundColor: 'rgba(120, 240, 188, 0.2)',
        borderRadius: 4,
    },
    toggleButtonText: {
        color: '#78F0BC',
        fontSize: 12,
    },
    emailContent: {
        padding: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        margin: 10,
        minHeight: 200,
    },
    webView: {
        height: 300,
        backgroundColor: 'transparent',
    },
    plainTextScroll: {
        padding: 16,
    },
    plainTextContent: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
    },
    webviewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
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
    retryButton: {
        backgroundColor: 'rgba(120, 240, 188, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#78F0BC',
        fontSize: 16,
    },
    attachmentsContainer: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        margin: 10,
        marginTop: 0,
    },
    attachmentsTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 6,
        marginVertical: 5,
    },
    attachmentDetails: {
        flex: 1,
        marginHorizontal: 10,
    },
    attachmentName: {
        fontSize: 14,
        color: '#fff',
    },
    attachmentSize: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
        marginTop: 0,
        marginBottom: 10,
    },
    copyButtonText: {
        color: '#78F0BC',
        marginLeft: 8,
        fontSize: 14,
    },
});
