import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as GuerrillaAPI from '../utils/tempMailService';
import { GuerrillaEmailResponse, GuerrillaAddressData } from '../utils/tempMailService';
import { useInterval } from '../utils/tempMailService';
import { useLocalSearchParams } from 'expo-router';


export default function GuerrillaMailInbox() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // const [emails, setEmails] = useState<GuerrillaEmailResponse[]>([]);
    const [emailData, setEmailData] = useState<GuerrillaAddressData | null>(null);
    const [pollingEnabled, setPollingEnabled] = useState(true);
    const [tokenInitialized, setTokenInitialized] = useState(false);
    const [sessionError, setSessionError] = useState(false);
    const { initialEmails } = useLocalSearchParams();

    const [emails, setEmails] = useState<GuerrillaEmailResponse[]>(() => {
        try {
            return typeof initialEmails === 'string' ? JSON.parse(initialEmails) : [];
        } catch {
            return [];
        }
    });



    // Load emails on component mount with improved error handling
    useEffect(() => {
        console.log("GuerrillaMailInbox mounted");
        loadUserData();

        // Stop polling when component unmounts
        return () => {
            console.log("GuerrillaMailInbox unmounted - stopping polling");
            setPollingEnabled(false);
        };
    }, []);

    // Load user email from secure storage with better error recovery
    const loadUserData = async () => {
        try {
            setLoading(true);
            setSessionError(false);
            const storedGuerrilla = await SecureStore.getItemAsync('guerrilla_data');

            if (storedGuerrilla) {
                console.log("Found stored guerrilla data");
                try {
                    const data = JSON.parse(storedGuerrilla) as GuerrillaAddressData;
                    setEmailData(data);

                    // Initialize the API with the stored token
                    if (data.sid_token) {
                        console.log("Initializing API with stored token:", data.sid_token.substring(0, 10) + "...");

                        // Ensure we have both properties
                        if (!data.email_user) {
                            console.warn("Missing email_user in stored data, using default");
                            data.email_user = data.email_addr.split('@')[0];
                        }

                        const success = GuerrillaAPI.initializeFromStoredData({
                            sid_token: data.sid_token,
                            email_user: data.email_user
                        });

                        if (success) {
                            setTokenInitialized(true);
                            console.log("Token initialized successfully, API ready");

                            // Verify token by checking inbox
                            try {
                                console.log("Verifying token by fetching messages...");
                                // Add a small delay to ensure initialization completes
                                await new Promise(resolve => setTimeout(resolve, 300));
                                const messages = await GuerrillaAPI.checkInbox();

                                if (Array.isArray(messages)) {
                                    console.log(`Successfully verified token with ${messages.length} emails`);
                                    if (Array.isArray(messages)) {
                                        setEmails(prevEmails => {
                                            const existingIds = new Set(prevEmails.map(e => e.mail_id));
                                            const newMessages = messages.filter(m => !existingIds.has(m.mail_id));
                                            // لو مفيش رسائل جديدة، خليه يرجع القديمة زي ما هي
                                            return newMessages.length > 0 ? [...newMessages, ...prevEmails] : prevEmails;
                                        });
                                    }

                                    setSessionError(false);
                                } else {
                                    throw new Error("Invalid response format");
                                }
                            } catch (fetchError) {
                                console.error("Error verifying token:", fetchError);
                                setSessionError(true);
                                // Try to re-initialize once more with a fresh token
                                await getNewEmailAddress();
                            }
                        } else {
                            console.warn("Token initialization failed");
                            setSessionError(true);
                            await getNewEmailAddress();
                        }
                    } else {
                        console.warn("No sid_token in stored data");
                        setSessionError(true);
                        await getNewEmailAddress();
                    }
                } catch (parseError) {
                    console.error("Error parsing stored data:", parseError);
                    setSessionError(true);
                    await getNewEmailAddress();
                }
            } else {
                // No email found, get a new one
                console.log("No stored data found, getting new email address");
                await getNewEmailAddress();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setSessionError(true);
            Alert.alert('Error', 'Failed to load email account. Please use the Reset button to get a new address.');
        } finally {
            setLoading(false);
        }
    };

    // Get a new email address with better error handling
    const getNewEmailAddress = async () => {
        try {
            setLoading(true);
            setTokenInitialized(false);
            setSessionError(false);

            // Clear any existing data first
            await SecureStore.deleteItemAsync('guerrilla_data');

            console.log("Getting new email address...");
            const newAddress = await GuerrillaAPI.getEmailAddress();

            if (newAddress && newAddress.email && newAddress.sidToken) {
                console.log("Got new email address:", newAddress.email);

                // Ensure we have the email_user field
                if (!newAddress.emailUser) {
                    newAddress.emailUser = newAddress.email.split('@')[0];
                }

                await saveEmailData(newAddress);

                // Initialize with the new token
                const success = GuerrillaAPI.initializeFromStoredData({
                    sid_token: newAddress.sidToken,
                    email_user: newAddress.emailUser
                });

                if (success) {
                    setTokenInitialized(true);
                    console.log("New API session initialized successfully");

                    // Verify it works by fetching initial emails
                    try {
                        // Add a small delay to ensure initialization completes
                        await new Promise(resolve => setTimeout(resolve, 300));
                        const messages = await GuerrillaAPI.checkInbox();
                        setEmails(Array.isArray(messages) ? messages : []);
                        setSessionError(false);
                    } catch (e) {
                        console.warn("Initial inbox check failed:", e);
                        // This is not critical, as inbox might just be empty
                    }

                    return true;
                } else {
                    console.error("Failed to initialize with new token");
                    setSessionError(true);
                    return false;
                }
            } else {
                console.error("Failed to get valid email address");
                setSessionError(true);
                Alert.alert('Error', 'Failed to create a new GuerrillaMail address. Please try again later.');
                return false;
            }
        } catch (error) {
            console.error('Error getting new email address:', error);
            setSessionError(true);
            Alert.alert('Error', 'Failed to create a new GuerrillaMail address. Please try again later.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Save email data to secure storage
    const saveEmailData = async (data: { email: string, sidToken: string, emailUser: string }) => {
        try {
            console.log("Saving email data:", data.email);
            const emailData = {
                email_addr: data.email,
                sid_token: data.sidToken,
                email_user: data.emailUser
            };

            setEmailData(emailData);
            await SecureStore.setItemAsync('guerrilla_data', JSON.stringify(emailData));
        } catch (error) {
            console.error('Error saving email data:', error);
        }
    };

    // Fetch emails with improved error handling and retry logic
    const fetchEmails = async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }

        try {
            // Double-check initialization before making API calls
            if (!GuerrillaAPI.isInitialized(emailData?.sid_token || '')) {
                console.warn('API not initialized for fetchEmails');

                // Try to re-initialize from stored data
                const storedGuerrilla = await SecureStore.getItemAsync('guerrilla_data');
                if (storedGuerrilla) {
                    const data = JSON.parse(storedGuerrilla);
                    const reInitialized = GuerrillaAPI.initializeFromStoredData({
                        sid_token: data.sid_token,
                        email_user: data.email_user || data.email_addr.split('@')[0]
                    });

                    if (!reInitialized) {
                        setSessionError(true);
                        if (showLoader) {
                            Alert.alert(
                                'Session Expired',
                                'Your email session has expired. Would you like to get a new email address?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Get New Email', onPress: () => getNewEmailAddress() }
                                ]
                            );
                        }
                        return;
                    }
                } else {
                    // No stored data available, create new session
                    setSessionError(true);
                    if (showLoader) {
                        Alert.alert(
                            'Session Expired',
                            'Your email session has expired. Would you like to get a new email address?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Get New Email', onPress: () => getNewEmailAddress() }
                            ]
                        );
                    }
                    return;
                }
            }

            console.log("Fetching emails with initialized API...");

            // First try to use checkInbox
            try {
                const messages = await GuerrillaAPI.checkInbox();

                if (Array.isArray(messages)) {
                    console.log(`Fetched ${messages.length} emails`);

                    // 🧠 دمج الرسائل الجديدة مع الحالية بدون تكرار
                    setEmails(prevEmails => {
                        const existingIds = new Set(prevEmails.map(e => e.mail_id));
                        const newMessages = messages.filter(m => !existingIds.has(m.mail_id));
                        return [...newMessages, ...prevEmails];
                    });

                    setSessionError(false);
                    return;
                }
                else {
                    console.warn('Unexpected response format from checkInbox, trying alternative');
                    // Fall through to alternative approach
                }
            } catch (error) {
                console.error('First fetch attempt failed:', error);
                // Fall through to alternative approach
            }

            // Alternative approach - force a new address check to refresh the session
            try {
                const url = `${GuerrillaAPI.GUERRILLA_BASE_URL}?f=get_email_address&sid_token=${emailData?.sid_token}`;
                console.log("Trying alternative fetch method");

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0'
                    }
                });

                if (response.ok) {
                    // Now try fetchEmails again
                    const messages = await GuerrillaAPI.checkInbox();
                    if (Array.isArray(messages)) {
                        console.log(`Alternative fetch succeeded with ${messages.length} emails`);
                        setEmails(messages);
                        setSessionError(false);
                        return;
                    }
                }
            } catch (altError) {
                console.error('Alternative fetch failed:', altError);
            }

            // If we get here, both attempts failed
            console.error('All fetch attempts failed');
            setSessionError(true);
            setEmails([]);  // Clear the emails to avoid showing stale data

            // Only show alert during manual actions, not background polling
            if (showLoader) {
                Alert.alert(
                    'Session Error',
                    'Failed to fetch emails. Your session may have expired. Please try resetting your session.',
                    [
                        { text: 'OK' },
                        {
                            text: 'Reset Session',
                            onPress: resetEmailAddress
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            setSessionError(true);
            if (showLoader) {
                Alert.alert('Error', 'Failed to load emails. Please try again or reset your session.');
            }
        } finally {
            if (showLoader) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    };

    // Refresh emails
    const onRefresh = useCallback(() => {
        console.log("Manual refresh triggered");
        setRefreshing(true);
        fetchEmails(false);
    }, [tokenInitialized]);

    // Reset email address
    const resetEmailAddress = async () => {
        Alert.alert(
            'Reset Email Address',
            'Are you sure you want to get a new email address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    onPress: async () => {
                        try {
                            // Forget current session if possible
                            await GuerrillaAPI.forgetMe();

                            // Get new address
                            const success = await getNewEmailAddress();

                            if (success) {
                                Alert.alert('Success', `New email address: ${emailData?.email_addr}`);
                            }
                        } catch (error) {
                            console.error('Error resetting email:', error);
                            Alert.alert('Error', 'Failed to reset email address.');
                        }
                    },
                },
            ]
        );
    };

    // Handle delete email (not fully supported by GuerrillaMail API,
    // but we can at least remove it from the local state)
    const handleDeleteEmail = (id: string) => {
        Alert.alert(
            'Delete Email',
            'Are you sure you want to remove this email from your inbox?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setEmails(emails.filter(email => email.mail_id !== id));
                    },
                },
            ],
        );
    };

    // View email details
    const viewEmailDetails = (emailId: string) => {
        router.push({
            pathname: '/EmailDetail',
            params: { id: emailId, provider: 'guerrilla' }
        });
    };

    // Format timestamp to readable date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render email item
    const renderEmailItem = ({ item }: { item: GuerrillaEmailResponse }) => {
        // Extract display name from "Name <email@example.com>" format
        let displayName = item.mail_from;
        const matches = item.mail_from.match(/(.*)\s<(.*)>/);
        if (matches && matches.length > 1) {
            displayName = matches[1];
        }

        // Get first letter for icon
        const firstLetter = displayName.charAt(0).toUpperCase();

        return (
            <TouchableOpacity
                style={styles.emailItem}
                onPress={() => viewEmailDetails(item.mail_id)}
            >
                <View style={styles.senderIcon}>
                    <Text style={styles.senderInitial}>
                        {firstLetter || 'U'}
                    </Text>
                </View>
                <View style={styles.emailContent}>
                    <Text style={styles.emailSender} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <Text style={styles.emailSubject} numberOfLines={1}>
                        {item.mail_subject || '(No subject)'}
                    </Text>
                    <Text style={styles.emailPreview} numberOfLines={1}>
                        {item.mail_excerpt || '(No content)'}
                    </Text>
                </View>
                <View style={styles.emailMeta}>
                    <Text style={styles.emailDate}>{formatDate(item.mail_timestamp)}</Text>
                    {item.att > 0 && (
                        <MaterialIcons name="attachment" size={16} color="#78F0BC" style={styles.attachmentIcon} />
                    )}
                    <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => handleDeleteEmail(item.mail_id)}
                    >
                        <MaterialIcons name="delete-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <View style={styles.container}>
                {/* Header - Simplified to match TempMailInbox */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            router.push({
                                pathname: '/TempMail',
                                params: {
                                    cachedEmails: JSON.stringify(emails), // 👈 مرّر الرسائل
                                },
                            });
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>GuerrillaMail Inbox</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                </View>

                {/* Email address banner */}
                {emailData?.email_addr && (
                    <View style={styles.emailBanner}>
                        <Ionicons name="mail" size={18} color="#78F0BC" />
                        <Text style={styles.emailAddress} numberOfLines={1}>
                            {emailData.email_addr}
                        </Text>
                        {sessionError && (
                            <View style={styles.errorBadge}>
                                <Text style={styles.errorBadgeText}>Session Error</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Session error banner */}
                {sessionError && !loading && (
                    <TouchableOpacity
                        style={styles.sessionErrorBanner}
                        onPress={resetEmailAddress}
                    >
                        <Ionicons name="warning" size={18} color="#FF6B6B" />
                        <Text style={styles.sessionErrorText}>
                            Session error detected. Tap here to reset your session.
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Email list */}
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#78F0BC" />
                        <Text style={styles.loadingText}>Loading emails...</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={emails}
                            renderItem={renderEmailItem}
                            keyExtractor={(item) => item.mail_id}
                            contentContainerStyle={styles.emailList}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#78F0BC" />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <FontAwesome name="inbox" size={60} color="#78F0BC" style={styles.emptyIcon} />
                                    <Text style={styles.emptyText}>
                                        {sessionError ? 'Session Error' : 'No emails yet'}
                                    </Text>
                                    <Text style={styles.emptySubText}>
                                        {sessionError
                                            ? 'Your session may have expired. Try resetting your session.'
                                            : 'New emails will appear here. Pull down to refresh.'}
                                    </Text>
                                    {sessionError && (
                                        <TouchableOpacity
                                            style={styles.resetButton}
                                            onPress={resetEmailAddress}
                                        >
                                            <Text style={styles.resetButtonText}>Reset Session</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            }
                        />
                    </>
                )}
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
    headerActions: {
        flexDirection: 'row',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    refreshButton: {
        padding: 5,
    },
    emailBanner: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    emailAddress: {
        fontSize: 14,
        color: '#78F0BC',
        marginLeft: 8,
        flex: 1,
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
    emailList: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },
    emailItem: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        marginBottom: 10,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(120, 240, 188, 0.2)',
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
    emailContent: {
        flex: 1,
    },
    emailSender: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    emailSubject: {
        fontSize: 14,
        color: '#78F0BC',
        marginBottom: 2,
    },
    emailPreview: {
        fontSize: 12,
        color: '#ccc',
    },
    emailMeta: {
        alignItems: 'flex-end',
        paddingLeft: 8,
    },
    emailDate: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    deleteIcon: {
        padding: 2,
    },
    attachmentIcon: {
        marginBottom: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        marginBottom: 20,
        opacity: 0.6,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    sessionErrorBanner: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 107, 107, 0.3)',
    },
    sessionErrorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    errorBadge: {
        backgroundColor: 'rgba(255, 107, 107, 0.8)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    errorBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: 'rgba(120, 240, 188, 0.2)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#78F0BC',
    },
    resetButtonText: {
        color: '#78F0BC',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
