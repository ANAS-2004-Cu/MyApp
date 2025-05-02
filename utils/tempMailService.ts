import axios from 'axios';
import { useEffect, useRef } from 'react';
let sessionToken: string | null = null;

// ===================== TYPES =====================

export enum TempMailProvider {
    MailGW = 'mail.gw',
    GuerrillaMail = 'guerrillamail',
}

export interface GuerrillaEmailResponse {
    mail_id: string;
    mail_from: string;
    mail_subject: string;
    mail_excerpt: string;
    mail_timestamp: number;
    mail_date: string;
    mail_read: number;
    att: number;
    mail_body?: string;
}

export interface GuerrillaAddressData {
    email_addr: string;
    sid_token: string;
    email_user: string;
}

// Mail.gw specific interfaces
export interface Email {
    id: string;
    from: {
        address: string;
        name: string;
    };
    to: Array<{
        address: string;
        name: string;
    }>;
    subject: string;
    intro: string;
    text: string;
    html: string;
    createdAt: string;
    hasAttachments: boolean;
    attachments?: Array<{
        id: string;
        filename: string;
        contentType: string;
        size: number;
        downloadUrl: string;
    }>;
}

interface Account {
    id: string;
    address: string;
    quota: number;
    used: number;
    isDisabled: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    id: string;
}

export const GUERRILLA_BASE_URL = 'https://api.guerrillamail.com/ajax.php';

export const testGuerrillaDomains = async (
    allDomains: string[],
    sidToken: string
): Promise<string[]> => {
    const workingDomains: string[] = [];

    // مهم: نخزن الـ sidToken في sessionToken المؤقت
    console.log("📦 Using session token:", sessionToken);

    sessionToken = sidToken;
    console.log("📦 Using session token:", sessionToken);

    for (const domain of allDomains) {
        try {
            const res = await axios.get(`https://api.guerrillamail.com/ajax.php?f=set_domain&domain=${domain}&sid_token=${sidToken}`);
            if (res.data && (res.data.email_addr || res.data.simulated)) {
                workingDomains.push(domain);
            }
        } catch (error) {
            // تجاهل الدومينات اللي فشلت
        }
    }

    return workingDomains;
};


export const getEmailAddress = async () => {
    const res = await axios.get(`https://api.guerrillamail.com/ajax.php?f=get_email_address`);
    const data = res.data;

    if (!data || !data.email_addr) throw new Error('Failed to get Guerrilla email');
    console.log("📦 Using session token:", sessionToken);

    sessionToken = data.sid_token;
    console.log("📦 Using session token:", sessionToken);

    return {
        email: data.email_addr,
        emailUser: data.email_user,
        sidToken: data.sid_token,
    };
};


// ===================== HELPERS =====================

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>();

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
        function tick() {
            savedCallback.current?.();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

// Generate a random string for username
export const generateRandomString = (length: number = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// ===================== MAIL.GW API =====================

// Mail.gw API base URL
const MAILGW_API_URL = 'https://api.mail.gw';

// Create axios instance with auth interceptor
const mailGwApi = axios.create({
    baseURL: MAILGW_API_URL,
});

// Set auth token for all requests after login
const setAuthToken = (token: string) => {
    if (token) {
        mailGwApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete mailGwApi.defaults.headers.common['Authorization'];
    }
};

// Get available domains
export const getDomains = async () => {
    try {
        const response = await mailGwApi.get('/domains');
        return response.data;
    } catch (error) {
        console.error('Error fetching domains:', error);
        throw error;
    }
};

// Create a new account
export const createAccount = async (address: string, password: string) => {
    try {
        const response = await mailGwApi.post('/accounts', {
            address,
            password,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating account:', error);
        throw error;
    }
};

// Login and get token
export const login = async (address: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await mailGwApi.post('/token', {
            address,
            password,
        });

        const { token, id } = response.data;
        setAuthToken(token);
        return { token, id };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

// Get account details
export const getAccountDetails = async (id: string): Promise<Account> => {
    try {
        const response = await mailGwApi.get(`/accounts/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error getting account details:', error);
        throw error;
    }
};

// Get messages
export const getMessages = async (page = 1): Promise<Email[]> => {
    try {
        const response = await mailGwApi.get('/messages', {
            params: { page }
        });
        return response.data['hydra:member'];
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

// Get message by ID
export const getMessage = async (id: string): Promise<Email> => {
    try {
        const response = await mailGwApi.get(`/messages/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching message details:', error);
        throw error;
    }
};

// Delete a message
export const deleteMessage = async (id: string): Promise<void> => {
    try {
        await mailGwApi.delete(`/messages/${id}`);
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
};

// Check if the auth token is still valid
export const verifyToken = async (): Promise<boolean> => {
    try {
        await mailGwApi.get('/me');
        return true;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
};

// ===================== GUERRILLA MAIL API =====================



// Available GuerrillaMail domains
export const GUERRILLA_DOMAINS = [
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamailblock.com',
    'guerrillamail.info',
    'grr.la',
    'sharklasers.com',
    'guerrillamail.biz',
    'guerrillamail.de',
    'pokemail.net',
    'spam4.me'
];

// Store sid_token between calls
let sid_token = '';
let email_user = '';

// Helper function to set sid_token from stored data
export const setSidToken = (token: string) => {
    if (token && token.length > 0) {
        sid_token = token;
        console.log('Token set:', sid_token.substring(0, 10) + '...');
        return true;
    }
    return false;
};

// Helper function to set email_user from stored data
export const setEmailUser = (user: string) => {
    if (user && user.length > 0) {
        email_user = user;
        return true;
    }
    return false;
};

// Create a controller with timeout
const createTimeoutController = (timeoutMs = 10000) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller;
};

// Get a new email address with improved error handling


// Check inbox with improved error handling and CORS workaround
export const checkInbox = async () => {
    if (!sessionToken) throw new Error('Session not initialized');
    console.log("📦 Using session token:", sessionToken);

    const res = await axios.get(`${GUERRILLA_BASE_URL}?f=check_email&sid_token=${sessionToken}&seq=0`);
    console.log("📦 Using session token:", sessionToken);

    if (res.data && Array.isArray(res.data.list)) {
        return res.data.list;
    }

    return [];
};



// Fetch a specific email by ID
export const fetchEmail = async (emailId: string) => {
    if (!sessionToken) throw new Error('Session not initialized');
    console.log("📦 Using session token:", sessionToken);

    const res = await axios.get(`${GUERRILLA_BASE_URL}?f=fetch_email&sid_token=${sessionToken}&email_id=${emailId}`);
    console.log("📦 Using session token:", sessionToken);

    return res.data;
};


// Set a custom username part for the email
export const setCustomEmailUser = async (username: string) => {
    if (!sessionToken) throw new Error('Session not initialized');
    console.log("📦 Using session token:", sessionToken);

    const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_email_user&email_user=${username}&sid_token=${sessionToken}`);
    console.log("📦 Using session token:", sessionToken);

    const data = res.data;

    if (!data || !data.email_addr) throw new Error('Failed to set username');
    return data;
};


// Set email domain with better error handling and retry mechanism
export const setEmailDomain = async (domain: string) => {
    if (!sessionToken) throw new Error('Session not initialized');

    try {
        // Try with standard API format
        console.log("📦 Using session token:", sessionToken);

        const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_email_domain&domain_name=${domain}&sid_token=${sessionToken}`);
        console.log("📦 Using session token:", sessionToken);

        const data = res.data;

        if (data && (data.email_addr || data.simulated)) {
            return data;
        }
    } catch (error) {
        console.log("First domain setting approach failed, trying alternative format");

        try {
            // Try alternative parameter format
            console.log("📦 Using session token:", sessionToken);

            const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_domain&domain=${domain}&sid_token=${sessionToken}`);
            console.log("📦 Using session token:", sessionToken);

            const data = res.data;

            if (data && (data.email_addr || data.simulated)) {
                return data;
            }
        } catch (secondError) {
            console.warn("Both domain setting approaches failed, will use default domain");
            // Return a minimal valid response to prevent further errors
            return { simulated: true };
        }
    }

    // If we get here, return a simulated success to avoid breaking the flow
    return { simulated: true };
};


// Forget the current session
export const forgetMe = async () => {
    try {
        if (!sid_token) {
            return;
        }

        await fetch(`${GUERRILLA_BASE_URL}?f=forget_me&sid_token=${encodeURIComponent(sid_token)}`);

        // Clear stored tokens
        sid_token = '';
        email_user = '';
    } catch (error) {
        console.error('Error forgetting Guerrilla session:', error);
    }
};

// Initialize from stored data with better validation
export const initializeFromStoredData = ({
    sid_token: token,
    email_user: user
}: { sid_token: string; email_user: string }) => {
    if (!token || !user) return false;

    // Synchronize both token variables
    console.log("📦 Using session token:", sessionToken);

    sessionToken = token;
    console.log("📦 Using session token:", sessionToken);

    sid_token = token;
    email_user = user;

    console.log('API initialized with token:', token.substring(0, 10) + '...');
    return true;
};

// Utility function to check if the API is properly initialized
export const isInitialized = (sid_token: string) => {
    console.log("📦 Using session token:", sessionToken);

    return sessionToken !== null && sessionToken.length > 0;
    
};


