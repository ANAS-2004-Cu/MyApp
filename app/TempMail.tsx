import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Modal,
    FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { createAccount, login, generateRandomString, getDomains } from '../utils/tempMailService';
import * as GuerrillaAPI from '../utils/tempMailService';
import { TempMailProvider, GUERRILLA_DOMAINS } from '../utils/tempMailService';
import { useLocalSearchParams } from 'expo-router';


export default function TempMail() {
    const { cachedEmails } = useLocalSearchParams();
    const [guerrillaCachedEmails, setGuerrillaCachedEmails] = useState<any[]>([]);
    const [username, setUsername] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [domains, setDomains] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [domainDropdownVisible, setDomainDropdownVisible] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<TempMailProvider>(TempMailProvider.MailGW);
    const [existingMailGw, setExistingMailGw] = useState<string | null>(null);
    const [existingGuerrilla, setExistingGuerrilla] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [guerrillaDomains, setGuerrillaDomains] = useState<string[]>(GUERRILLA_DOMAINS);
    const [selectedGuerrillaDomain, setSelectedGuerrillaDomain] = useState(GUERRILLA_DOMAINS[0]);
    const [guerrillaDomainDropdownVisible, setGuerrillaDomainDropdownVisible] = useState(false);

    useEffect(() => {
        if (cachedEmails) {
            try {
                const parsed = typeof cachedEmails === 'string' ? JSON.parse(cachedEmails) : cachedEmails;
                if (Array.isArray(parsed)) {
                    setGuerrillaCachedEmails(parsed);
                }
            } catch (err) {
                console.warn("Failed to parse cachedEmails:", err);
            }
        }
    }, [cachedEmails]);

    // Set up initial state
    useEffect(() => {
        const setup = async () => {
            setIsInitializing(true);
            try {
                // Check for existing accounts
                await checkExistingAccounts();

                // Load domains based on selected provider
                if (selectedProvider === TempMailProvider.MailGW) {
                    await loadDomains();
                } else {
                    // Set guerrilla domains from the constant
                    // Get initial Guerrilla email (session + sid_token)
                    // استخدم البريد المحفوظ لو موجود
                    let emailData;
                    const existingGuerrillaRaw = await SecureStore.getItemAsync('guerrilla_data');

                    if (existingGuerrillaRaw) {
                        const existing = JSON.parse(existingGuerrillaRaw);
                        emailData = {
                            email: existing.email_addr,
                            sidToken: existing.sid_token,
                            emailUser: existing.email_user,
                        };
                    } else {
                        emailData = await GuerrillaAPI.getEmailAddress();
                        await SecureStore.setItemAsync('guerrilla_data', JSON.stringify({
                            email_addr: emailData.email,
                            sid_token: emailData.sidToken,
                            email_user: emailData.emailUser,
                        }));
                    }

                    // جرّب الدومينات المتاحة وشوف إيه اللي بيشتغل فعلاً
                    const validDomains = await GuerrillaAPI.testGuerrillaDomains(GUERRILLA_DOMAINS, emailData.sidToken);

                    // fallback: لو كلها فشلت، نستخدم القائمة الأصلية
                    const finalDomains = validDomains.length > 0 ? validDomains : GUERRILLA_DOMAINS;

                    setGuerrillaDomains(finalDomains);
                    setSelectedGuerrillaDomain(finalDomains[0]);
                }

                // Set random username
                generateRandomUsername();
            } catch (error) {
                console.error('Setup error:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        setup();
    }, [selectedProvider]);

    // Check for existing temporary email accounts
    const checkExistingAccounts = async () => {
        try {
            // Check for Mail.GW account
            const mailGwData = await SecureStore.getItemAsync('mailgw_data');
            if (mailGwData) {
                const data = JSON.parse(mailGwData);
                setExistingMailGw(data.email);
            }

            // Check for GuerrillaMail account
            const guerrillaData = await SecureStore.getItemAsync('guerrilla_data');
            if (guerrillaData) {
                const data = JSON.parse(guerrillaData);
                setExistingGuerrilla(data.email_addr);
            }
        } catch (error) {
            console.error('Error checking existing accounts:', error);
        }
    };

    // Load available domains for Mail.GW
    const loadDomains = async () => {
        try {
            const domainsData = await getDomains();
            if (domainsData && Array.isArray(domainsData['hydra:member'])) {
                const domainList = domainsData['hydra:member'].map((domain: any) => domain.domain);
                setDomains(domainList);
                setSelectedDomain(domainList[0] || '');
            }
        } catch (error) {
            console.error('Error loading domains:', error);
            // Fallback domains in case API fails
            const fallbackDomains = ['mail.gw', 'mailgw.com'];
            setDomains(fallbackDomains);
            setSelectedDomain(fallbackDomains[0]);
        }
    };

    // Generate random username
    const generateRandomUsername = () => {
        setUsername(generateRandomString(10));
    };

    // Handle provider selection
    const selectProvider = (provider: TempMailProvider) => {
        setSelectedProvider(provider);
    };

    // Create a new temporary email
    const createNewEmail = async () => {
        if (selectedProvider === TempMailProvider.MailGW) {
            await createMailGwEmail();
        } else {
            await createGuerrillaEmail();
        }
    };

    // Create new Mail.GW email
    const createMailGwEmail = async () => {
        try {
            if (!username || !selectedDomain) {
                Alert.alert('Error', 'Please enter a username and select a domain');
                return;
            }

            setLoading(true);
            const email = `${username}@${selectedDomain}`;
            const password = generateRandomString(12);

            // Create account
            await createAccount(email, password);

            // Login to get token
            const authData = await login(email, password);

            // Save account data
            await SecureStore.setItemAsync('mailgw_data', JSON.stringify({
                email,
                password,
                token: authData.token,
                id: authData.id
            }));

            // Update existing account info
            setExistingMailGw(email);

            // Show success message instead of navigating
            Alert.alert(
                'Success',
                `Email ${email} created successfully!`,
                [
                    {
                        text: 'Copy Email',
                        onPress: () => copyToClipboard(email)
                    },
                    {
                        text: 'OK'
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating Mail.GW email:', error);
            Alert.alert(
                'Error',
                'Failed to create email account. The username might be taken or the service is temporarily unavailable.',
                [
                    { text: 'Try Again', onPress: generateRandomUsername },
                    { text: 'OK' }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    // Create new GuerrillaMail email
    const createGuerrillaEmail = async () => {
        try {
            if (!username) {
                Alert.alert('Error', 'Please enter a username');
                return;
            }

            setLoading(true);

            // 1. Get temporary email (initial session)
            const emailData = await GuerrillaAPI.getEmailAddress();

            if (!emailData || !emailData.email) {
                throw new Error('Failed to get email address');
            }

            let finalUsername = username;
            let finalDomain = selectedGuerrillaDomain;

            // 2. Try to set custom username
            try {
                const userResult = await GuerrillaAPI.setCustomEmailUser(username);
                if (userResult?.email_addr) {
                    finalUsername = userResult.email_addr.split('@')[0];
                }
            } catch (error) {
                console.warn('Failed to set custom username, using default:', error);
                finalUsername = emailData.emailUser;
            }

            // 3. Try to set selected domain with better error handling
            try {
                const domainResult = await GuerrillaAPI.setEmailDomain(selectedGuerrillaDomain);

                if (domainResult?.email_addr) {
                    // Success case - extract domain from full email address
                    finalDomain = domainResult.email_addr.split('@')[1];
                } else if (domainResult?.simulated) {
                    // Semi-success case - use selected domain but be aware it might not work
                    console.log(`Using selected domain ${selectedGuerrillaDomain}, but it might not be applied correctly`);
                    finalDomain = selectedGuerrillaDomain;
                } else {
                    // Fallback case
                    console.warn('Domain could not be set, using default Guerrilla domain');
                    finalDomain = emailData.email.split('@')[1];
                }
            } catch (error) {
                console.warn('Set domain failed completely, using default domain from initial email:', error);
                finalDomain = emailData.email.split('@')[1];
            }

            // 4. Construct final email address with the results we have
            const finalEmailAddr = `${finalUsername}@${finalDomain}`;

            // 5. Save session/token locally
            await SecureStore.setItemAsync('guerrilla_data', JSON.stringify({
                email_addr: finalEmailAddr,
                sid_token: emailData.sidToken,
                email_user: finalUsername,
            }));
            setGuerrillaCachedEmails([]);

            setExistingGuerrilla(finalEmailAddr);

            Alert.alert(
                'Success',
                `Email ${finalEmailAddr} created successfully!`,
                [
                    {
                        text: 'Copy Email',
                        onPress: () => copyToClipboard(finalEmailAddr)
                    },
                    {
                        text: 'OK'
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating GuerrillaMail email:', error);
            Alert.alert(
                'Error',
                'Failed to create GuerrillaMail account. Please try again later.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };


    // Access existing email inbox
    const accessExistingInbox = (provider: TempMailProvider) => {
        if (provider === TempMailProvider.MailGW) {
            router.push('/TempMailInbox');
        } else {
            router.push({
                pathname: '/GuerrillaMailInbox',
                params: {
                    initialEmails: JSON.stringify(guerrillaCachedEmails ?? []),
                },
            });
        }
    };


    // Copy email address to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            Alert.alert('Success', 'Email address copied to clipboard');
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    };

    // Toggle domain dropdown visibility
    const toggleDomainDropdown = () => {
        setDomainDropdownVisible(!domainDropdownVisible);
    };

    // Select domain from dropdown
    const handleDomainSelect = (domain: string) => {
        setSelectedDomain(domain);
        setDomainDropdownVisible(false);
    };

    // Toggle Guerrilla domain dropdown visibility
    const toggleGuerrillaDomainDropdown = () => {
        setGuerrillaDomainDropdownVisible(!guerrillaDomainDropdownVisible);
    };

    // Select Guerrilla domain from dropdown
    const handleGuerrillaDomainSelect = (domain: string) => {
        setSelectedGuerrillaDomain(domain);
        setGuerrillaDomainDropdownVisible(false);
    };

    return (
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
                            <Ionicons name="arrow-back" size={24} color="#78F0BC" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Temporary Email</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    {/* Provider Selection */}
                    <View style={styles.providerContainer}>
                        <Text style={styles.sectionTitle}>Select Provider</Text>
                        <View style={styles.providerButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.providerButton,
                                    selectedProvider === TempMailProvider.MailGW && styles.providerButtonSelected,
                                ]}
                                onPress={() => selectProvider(TempMailProvider.MailGW)}
                            >
                                <Text
                                    style={[
                                        styles.providerButtonText,
                                        selectedProvider === TempMailProvider.MailGW && styles.providerButtonTextSelected,
                                    ]}
                                >
                                    Mail.GW
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.providerButton,
                                    selectedProvider === TempMailProvider.GuerrillaMail && styles.providerButtonSelected,
                                ]}
                                onPress={() => selectProvider(TempMailProvider.GuerrillaMail)}
                            >
                                <Text
                                    style={[
                                        styles.providerButtonText,
                                        selectedProvider === TempMailProvider.GuerrillaMail && styles.providerButtonTextSelected,
                                    ]}
                                >
                                    GuerrillaMail
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Existing Accounts Section */}
                    {((selectedProvider === TempMailProvider.MailGW && existingMailGw) ||
                        (selectedProvider === TempMailProvider.GuerrillaMail && existingGuerrilla)) && (
                            <View style={styles.existingContainer}>
                                <Text style={styles.sectionTitle}>
                                    Existing {selectedProvider === TempMailProvider.MailGW ? 'Mail.GW' : 'GuerrillaMail'} Account
                                </Text>
                                <View style={styles.existingEmailCard}>
                                    <View style={styles.existingEmailContent}>
                                        <Text style={styles.existingEmailAddress}>
                                            {selectedProvider === TempMailProvider.MailGW ? existingMailGw : existingGuerrilla}
                                        </Text>
                                    </View>
                                    <View style={styles.existingEmailActions}>
                                        <TouchableOpacity
                                            style={styles.iconButton}
                                            onPress={() => copyToClipboard(
                                                selectedProvider === TempMailProvider.MailGW ? existingMailGw! : existingGuerrilla!
                                            )}
                                        >
                                            <MaterialIcons name="content-copy" size={24} color="#78F0BC" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.accessButton}
                                            onPress={() => accessExistingInbox(selectedProvider)}
                                        >
                                            <Text style={styles.accessButtonText}>Open Inbox</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                    {/* Create New Email Section */}
                    <View style={styles.createContainer}>
                        <Text style={styles.sectionTitle}>
                            Create New {selectedProvider === TempMailProvider.MailGW ? 'Mail.GW' : 'GuerrillaMail'} Email
                        </Text>

                        {selectedProvider === TempMailProvider.MailGW ? (
                            // Mail.GW email creation
                            <View style={styles.inputContainer}>
                                <View style={styles.usernameContainer}>
                                    <TextInput
                                        style={styles.usernameInput}
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="Username"
                                        placeholderTextColor="#666"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity style={styles.refreshButton} onPress={generateRandomUsername}>
                                        <Ionicons name="refresh" size={24} color="#78F0BC" />
                                    </TouchableOpacity>
                                </View>

                                {/* Domain selector with popup */}
                                <View style={styles.domainSelectorContainer}>
                                    <Text style={styles.domainSelectorLabel}>Select Domain:</Text>
                                    <TouchableOpacity
                                        style={styles.domainDropdownButton}
                                        onPress={toggleDomainDropdown}
                                    >
                                        <Text style={styles.domainDropdownButtonText}>
                                            @{selectedDomain}
                                        </Text>
                                        <Ionicons
                                            name={domainDropdownVisible ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color="#78F0BC"
                                        />
                                    </TouchableOpacity>

                                    {/* Domain selection modal */}
                                    <Modal
                                        transparent={true}
                                        visible={domainDropdownVisible}
                                        animationType="fade"
                                        onRequestClose={() => setDomainDropdownVisible(false)}
                                    >
                                        <TouchableOpacity
                                            style={styles.modalOverlay}
                                            activeOpacity={1}
                                            onPress={() => setDomainDropdownVisible(false)}
                                        >
                                            <View style={styles.domainModalContent}>
                                                <Text style={styles.domainModalTitle}>Select Domain</Text>
                                                <FlatList
                                                    data={domains}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.domainListItem,
                                                                selectedDomain === item && styles.selectedDomainListItem
                                                            ]}
                                                            onPress={() => handleDomainSelect(item)}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.domainListItemText,
                                                                    selectedDomain === item && styles.selectedDomainListItemText
                                                                ]}
                                                            >
                                                                @{item}
                                                            </Text>
                                                            {selectedDomain === item && (
                                                                <Ionicons name="checkmark" size={20} color="#78F0BC" />
                                                            )}
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </Modal>
                                </View>

                                {/* Preview of the full email */}
                                <View style={styles.emailPreview}>
                                    <Text style={styles.emailPreviewLabel}>Your email will be:</Text>
                                    <Text style={styles.emailPreviewText}>{username}@{selectedDomain}</Text>
                                </View>
                            </View>
                        ) : (
                            // GuerrillaMail email creation - now similar to Mail.GW
                            <View style={styles.inputContainer}>
                                <View style={styles.usernameContainer}>
                                    <TextInput
                                        style={styles.usernameInput}
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="Username"
                                        placeholderTextColor="#666"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity style={styles.refreshButton} onPress={generateRandomUsername}>
                                        <Ionicons name="refresh" size={24} color="#78F0BC" />
                                    </TouchableOpacity>
                                </View>

                                {/* Domain selector for GuerrillaMail */}
                                <View style={styles.domainSelectorContainer}>
                                    <Text style={styles.domainSelectorLabel}>Select Domain:</Text>
                                    <TouchableOpacity
                                        style={styles.domainDropdownButton}
                                        onPress={toggleGuerrillaDomainDropdown}
                                    >
                                        <Text style={styles.domainDropdownButtonText}>
                                            @{selectedGuerrillaDomain}
                                        </Text>
                                        <Ionicons
                                            name={guerrillaDomainDropdownVisible ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color="#78F0BC"
                                        />
                                    </TouchableOpacity>

                                    {/* Domain selection modal for GuerrillaMail */}
                                    <Modal
                                        transparent={true}
                                        visible={guerrillaDomainDropdownVisible}
                                        animationType="fade"
                                        onRequestClose={() => setGuerrillaDomainDropdownVisible(false)}
                                    >
                                        <TouchableOpacity
                                            style={styles.modalOverlay}
                                            activeOpacity={1}
                                            onPress={() => setGuerrillaDomainDropdownVisible(false)}
                                        >
                                            <View style={styles.domainModalContent}>
                                                <Text style={styles.domainModalTitle}>Select Domain</Text>
                                                <FlatList
                                                    data={guerrillaDomains}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.domainListItem,
                                                                selectedGuerrillaDomain === item && styles.selectedDomainListItem
                                                            ]}
                                                            onPress={() => handleGuerrillaDomainSelect(item)}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.domainListItemText,
                                                                    selectedGuerrillaDomain === item && styles.selectedDomainListItemText
                                                                ]}
                                                            >
                                                                @{item}
                                                            </Text>
                                                            {selectedGuerrillaDomain === item && (
                                                                <Ionicons name="checkmark" size={20} color="#78F0BC" />
                                                            )}
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </Modal>
                                </View>

                                {/* Preview of the full email */}
                                <View style={styles.emailPreview}>
                                    <Text style={styles.emailPreviewLabel}>Your email will be:</Text>
                                    <Text style={styles.emailPreviewText}>{username}@{selectedGuerrillaDomain}</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={createNewEmail}
                            disabled={loading || isInitializing}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.createButtonText}>
                                    Create Email
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Help Text */}
                    <View style={styles.helpContainer}>
                        <Text style={styles.helpTitle}>How It Works</Text>
                        <Text style={styles.helpText}>
                            Temporary emails are disposable addresses that help protect your privacy online.
                            Use them for sign-ups, verifications, or anywhere you don't want to share your
                            real email address.
                        </Text>
                        <Text style={styles.helpText}>
                            • Mail.GW emails typically last 10 days{'\n'}
                            • GuerrillaMail emails typically last a few hours{'\n'}
                            • All emails are automatically deleted after expiration
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        paddingBottom: 40,
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
    providerContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    providerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    providerButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#78F0BC',
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    providerButtonSelected: {
        backgroundColor: 'rgba(120, 240, 188, 0.2)',
    },
    providerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    providerButtonTextSelected: {
        color: '#78F0BC',
    },
    existingContainer: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
    },
    existingEmailCard: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    existingEmailContent: {
        flex: 1,
    },
    existingEmailAddress: {
        color: '#78F0BC',
        fontSize: 14,
    },
    existingEmailActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 5,
        marginRight: 8,
    },
    accessButton: {
        backgroundColor: 'rgba(120, 240, 188, 0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    accessButtonText: {
        color: '#78F0BC',
        fontWeight: 'bold',
    },
    createContainer: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
    },
    inputContainer: {
        marginBottom: 16,
    },
    usernameContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    usernameInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        marginRight: 8,
    },
    refreshButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    domainSelectorContainer: {
        marginVertical: 12,
    },
    domainSelectorLabel: {
        color: '#fff',
        marginBottom: 8,
        fontSize: 14,
    },
    domainDropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    domainDropdownButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    domainModalContent: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        width: '90%',
        maxHeight: '70%',
        borderWidth: 1,
        borderColor: '#333',
    },
    domainModalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    domainListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    selectedDomainListItem: {
        backgroundColor: 'rgba(120, 240, 188, 0.1)',
    },
    domainListItemText: {
        color: '#fff',
        fontSize: 16,
    },
    selectedDomainListItemText: {
        color: '#78F0BC',
        fontWeight: 'bold',
    },
    emailPreview: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    emailPreviewLabel: {
        color: '#ccc',
        fontSize: 12,
        marginBottom: 4,
    },
    emailPreviewText: {
        color: '#78F0BC',
        fontSize: 16,
        fontWeight: 'bold',
    },
    guerrillaInfo: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    guerrillaInfoText: {
        color: '#ccc',
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#78F0BC',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    helpContainer: {
        margin: 16,
        marginTop: 8,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 12,
    },
    helpTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    helpText: {
        color: '#ccc',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
});
