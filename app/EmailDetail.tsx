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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getMessage, Email, deleteMessage } from '../utils/tempMailApi';

export default function EmailDetail() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<Email | null>(null);
    const [showHtml, setShowHtml] = useState(true);
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
            const emailData = await getMessage(id);
            setEmail(emailData);
        } catch (error) {
            console.error('Error fetching email details:', error);
            Alert.alert('Error', 'Failed to load email details. Please try again.');
            router.back();
        } finally {
            setLoading(false);
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
                            await deleteMessage(email.id);
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

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Download attachment
    const downloadAttachment = async (attachment: any) => {
        try {
            const fileUri = FileSystem.documentDirectory + attachment.filename;
            const downloadResumable = FileSystem.createDownloadResumable(
                attachment.downloadUrl,
                fileUri
            );

            const downloadResult = await downloadResumable.downloadAsync();

            if (downloadResult && downloadResult.uri) {
                await Sharing.shareAsync(downloadResult.uri);
            }
        } catch (error) {
            console.error('Error downloading attachment:', error);
            Alert.alert('Error', 'Failed to download attachment. Please try again.');
        }
    };

    // Toggle between HTML and plain text view
    const toggleContentView = () => {
        setShowHtml(!showHtml);
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

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {email.subject || '(No subject)'}
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
                                    {email.from.name ? email.from.name.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <View style={styles.senderInfo}>
                                <Text style={styles.senderName}>{email.from.name || 'Unknown'}</Text>
                                <Text style={styles.senderAddress}>{email.from.address}</Text>
                            </View>
                        </View>

                        <View style={styles.recipientContainer}>
                            <Text style={styles.recipientLabel}>To: </Text>
                            <Text style={styles.recipientAddress}>
                                {email.to.map(recipient => recipient.address).join(', ')}
                            </Text>
                        </View>

                        <Text style={styles.dateText}>
                            {formatDate(email.createdAt)}
                        </Text>
                    </View>

                    {/* View toggle button */}
                    {email.html && (
                        <TouchableOpacity style={styles.toggleButton} onPress={toggleContentView}>
                            <Text style={styles.toggleButtonText}>
                                View {showHtml ? 'Plain Text' : 'HTML'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Email content */}
                    <View style={styles.emailContent}>
                        {showHtml && email.html ? (
                            <RenderHtml
                                contentWidth={width - 32}
                                source={{ html: email.html }}
                                baseStyle={styles.htmlContent}
                                tagsStyles={{
                                    body: { color: '#fff', fontFamily: 'System' },
                                    a: { color: '#78F0BC', textDecorationLine: 'underline' },
                                }}
                                renderersProps={{
                                    a: {
                                        onPress: (_, href) => {
                                            Linking.openURL(href);
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <Text style={styles.plainTextContent}>{email.text}</Text>
                        )}
                    </View>

                    {/* Attachments */}
                    {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
                        <View style={styles.attachmentsContainer}>
                            <Text style={styles.attachmentsTitle}>
                                Attachments ({email.attachments.length})
                            </Text>
                            {email.attachments.map((attachment, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.attachmentItem}
                                    onPress={() => downloadAttachment(attachment)}
                                >
                                    <MaterialIcons name="attachment" size={20} color="#78F0BC" />
                                    <View style={styles.attachmentDetails}>
                                        <Text style={styles.attachmentName} numberOfLines={1}>
                                            {attachment.filename}
                                        </Text>
                                        <Text style={styles.attachmentSize}>
                                            {(attachment.size / 1024).toFixed(0)} KB
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
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        margin: 10,
    },
    htmlContent: {
        color: '#fff',
        fontSize: 16,
    },
    plainTextContent: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
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
});
