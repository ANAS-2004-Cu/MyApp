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
import { getMessages, Email, deleteMessage } from '../utils/tempMailService';

export default function TempMailInbox() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [emails, setEmails] = useState<Email[]>([]);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        loadUserData();
        fetchEmails();
    }, []);

    const loadUserData = async () => {
        try {
            const storedMailGw = await SecureStore.getItemAsync('mailgw_data');
            if (storedMailGw) {
                const data = JSON.parse(storedMailGw);
                setEmail(data.email);
            } else {
                Alert.alert('Error', 'No active Mail.GW email found. Please create one first.');
                router.replace('/TempMail');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load user data. Please try again.');
        }
    };

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const messages = await getMessages();
            setEmails(messages || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load emails. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEmails();
    }, []);

    const handleDeleteEmail = async (id: string) => {
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
                            await deleteMessage(id);
                            setEmails(emails.filter(email => email.id !== id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete email. Please try again.');
                        }
                    },
                },
            ],
        );
    };

    const viewEmailDetails = (emailId: string) => {
        router.push({
            pathname: '/EmailDetail',
            params: { id: emailId, provider: 'mailgw' }
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderEmailItem = ({ item }: { item: Email }) => (
        <TouchableOpacity
            style={styles.emailItem}
            onPress={() => viewEmailDetails(item.id)}
        >
            <View style={styles.senderIcon}>
                <Text style={styles.senderInitial}>
                    {item.from.name ? item.from.name.charAt(0).toUpperCase() : 'U'}
                </Text>
            </View>
            <View style={styles.emailContent}>
                <Text style={styles.emailSender} numberOfLines={1}>
                    {item.from.name || item.from.address}
                </Text>
                <Text style={styles.emailSubject} numberOfLines={1}>
                    {item.subject || '(No subject)'}
                </Text>
                <Text style={styles.emailPreview} numberOfLines={1}>
                    {item.intro || '(No content)'}
                </Text>
            </View>
            <View style={styles.emailMeta}>
                <Text style={styles.emailDate}>{formatDate(item.createdAt)}</Text>
                <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleDeleteEmail(item.id)}
                >
                    <MaterialIcons name="delete-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mail.GW Inbox</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={24} color="#78F0BC" />
                    </TouchableOpacity>
                </View>

                {email && (
                    <View style={styles.emailBanner}>
                        <Ionicons name="mail" size={18} color="#78F0BC" />
                        <Text style={styles.emailAddress} numberOfLines={1}>
                            {email}
                        </Text>
                    </View>
                )}

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
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.emailList}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#78F0BC" />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <FontAwesome name="inbox" size={60} color="#78F0BC" style={styles.emptyIcon} />
                                    <Text style={styles.emptyText}>No emails yet</Text>
                                    <Text style={styles.emptySubText}>
                                        New emails will appear here. Pull down to refresh.
                                    </Text>
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
});
