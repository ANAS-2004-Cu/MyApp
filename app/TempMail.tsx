import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Clipboard,
    ToastAndroid,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import {
    getDomains,
    createAccount,
    login,
    generateRandomString,
    verifyToken
} from '../utils/tempMailApi';

export default function TempMail() {
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [domains, setDomains] = useState<string[]>([]);
    const [selectedDomain, setSelectedDomain] = useState('');

    // Initialize - check for existing account or prepare for new one
    useEffect(() => {
        const initialize = async () => {
            try {
                // Check if we already have credentials in secure storage
                const storedEmail = await SecureStore.getItemAsync('temp_email');
                const storedPassword = await SecureStore.getItemAsync('temp_password');
                const storedToken = await SecureStore.getItemAsync('temp_token');

                if (storedEmail && storedPassword && storedToken) {
                    // Verify if token is still valid
                    const isValid = await verifyToken();

                    if (isValid) {
                        setEmail(storedEmail);
                        setPassword(storedPassword);
                        setInitializing(false);
                        return;
                    }
                }

                // If no valid account exists, prepare for creating a new one
                const domainsData = await getDomains();
                if (domainsData && domainsData['hydra:member'] && domainsData['hydra:member'].length > 0) {
                    const availableDomains = domainsData['hydra:member'].map((domain: any) => domain.domain);
                    setDomains(availableDomains);
                    setSelectedDomain(availableDomains[0]);
                }

                setInitializing(false);
            } catch (error) {
                console.error('Initialization error:', error);
                setInitializing(false);
                Alert.alert('Error', 'Failed to initialize the app. Please try again.');
            }
        };

        initialize();
    }, []);

    // Create a new temporary email address
    const createTemporaryEmail = async () => {
        try {
            setLoading(true);

            // Generate random username and password
            const username = generateRandomString(12);
            const newPassword = generateRandomString(12);
            const newEmail = `${username}@${selectedDomain}`;

            // Create the account
            await createAccount(newEmail, newPassword);

            // Login to get token
            const authResponse = await login(newEmail, newPassword);

            // Store credentials securely
            await SecureStore.setItemAsync('temp_email', newEmail);
            await SecureStore.setItemAsync('temp_password', newPassword);
            await SecureStore.setItemAsync('temp_token', authResponse.token);
            await SecureStore.setItemAsync('temp_id', authResponse.id);

            setEmail(newEmail);
            setPassword(newPassword);

            // Notify user
            showToast('Email created successfully!');

        } catch (error) {
            console.error('Error creating email:', error);
            Alert.alert('Error', 'Failed to create temporary email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Copy email to clipboard
    const copyToClipboard = () => {
        Clipboard.setString(email);
        showToast('Email copied to clipboard');
    };

    // Delete current email
    const deleteEmail = async () => {
        Alert.alert(
            'Delete Email',
            'Are you sure you want to delete this temporary email? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear stored credentials
                            await SecureStore.deleteItemAsync('temp_email');
                            await SecureStore.deleteItemAsync('temp_password');
                            await SecureStore.deleteItemAsync('temp_token');
                            await SecureStore.deleteItemAsync('temp_id');

                            // Reset state
                            setEmail('');
                            setPassword('');

                            // Refresh domains list
                            const domainsData = await getDomains();
                            if (domainsData && domainsData['hydra:member'] && domainsData['hydra:member'].length > 0) {
                                const availableDomains = domainsData['hydra:member'].map((domain: any) => domain.domain);
                                setDomains(availableDomains);
                                setSelectedDomain(availableDomains[0]);
                            }

                            showToast('Email deleted successfully');
                        } catch (error) {
                            console.error('Error deleting email:', error);
                            Alert.alert('Error', 'Failed to delete email. Please try again.');
                        }
                    },
                },
            ],
        );
    };

    // Show toast message
    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(message);
        }
    };

    // Go to inbox
    const goToInbox = () => {
        router.push('/TempMailInbox');
    };

    // Go back to home screen
    const goHome = () => {
        router.push('/');
    };

    // Render loading state
    if (initializing) {
        return (
            <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#78F0BC" />
                    <Text style={styles.loadingText}>Initializing...</Text>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.header}>TEMP-MAIL</Text>

                {/* Email information section */}
                <View style={styles.emailSection}>
                    {email ? (
                        <View style={styles.emailCard}>
                            <Text style={styles.emailTitle}>Your temporary email:</Text>
                            <View style={styles.emailAddressContainer}>
                                <Text style={styles.emailAddress}>{email}</Text>
                                <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                                    <MaterialIcons name="content-copy" size={24} color="#78F0BC" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.emailInfo}>
                                This email will expire after 10 hours or when you delete it.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.createEmailSection}>
                            <Text style={styles.createEmailTitle}>Create a new temporary email</Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={createTemporaryEmail}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={styles.createButtonText}>Generate Email</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                    {email && (
                        <>
                            <TouchableOpacity style={styles.actionButton} onPress={goToInbox}>
                                <Ionicons name="mail-outline" size={24} color="#78F0BC" />
                                <Text style={styles.actionButtonText}>View Inbox</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={deleteEmail}>
                                <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
                                <Text style={[styles.actionButtonText, styles.deleteText]}>Delete Email</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Info section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>About Temporary Emails</Text>
                    <Text style={styles.infoText}>
                        • Protect your privacy online{"\n"}
                        • Avoid spam in your primary inbox{"\n"}
                        • No registration required{"\n"}
                        • Temporary - automatically expires{"\n"}
                        • Perfect for one-time signups
                    </Text>
                </View>

                {/* Home button */}
                <TouchableOpacity style={styles.homeButton} onPress={goHome}>
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 16,
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
    header: {
        fontSize: 30,
        color: "gold",
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        height: 50,
        backgroundColor: "rgba(0,0,0,0.5)",
        textAlignVertical: "center",
        marginBottom: 20,
        borderRadius: 10,
    },
    emailSection: {
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(120, 240, 188, 0.3)',
    },
    emailCard: {
        alignItems: 'center',
    },
    emailTitle: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
    },
    emailAddressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
        padding: 15,
        width: '100%',
        marginBottom: 10,
    },
    emailAddress: {
        fontSize: 16,
        color: '#78F0BC',
        fontWeight: 'bold',
        flex: 1,
    },
    copyButton: {
        padding: 5,
    },
    emailInfo: {
        fontSize: 12,
        color: '#ccc',
        textAlign: 'center',
    },
    createEmailSection: {
        alignItems: 'center',
    },
    createEmailTitle: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#78F0BC',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        minWidth: 200,
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'rgba(120, 240, 188, 0.3)',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#78F0BC',
        marginLeft: 5,
    },
    deleteButton: {
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    deleteText: {
        color: '#FF6B6B',
    },
    infoSection: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(120, 240, 188, 0.3)',
    },
    infoTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 24,
    },
    homeButton: {
        backgroundColor: '#78F0BC',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 20,
    },
    homeButtonText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
});
