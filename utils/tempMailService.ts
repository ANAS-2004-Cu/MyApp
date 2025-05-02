import axios from 'axios';
import { useEffect, useRef } from 'react';
let sessionToken: string | null = null;

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
    sessionToken = sidToken;

    for (const domain of allDomains) {
        try {
            const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_domain&domain=${domain}&sid_token=${sidToken}`);
            if (res.data && (res.data.email_addr || res.data.simulated)) {
                workingDomains.push(domain);
            }
        } catch (error) {
            // Skip failed domains
        }
    }

    return workingDomains;
};

export const getEmailAddress = async () => {
    try {
        const res = await axios.get(`${GUERRILLA_BASE_URL}?f=get_email_address`);
        const data = res.data;

        if (!data || !data.email_addr) throw new Error('Failed to get Guerrilla email');

        sessionToken = data.sid_token;

        return {
            email: data.email_addr,
            emailUser: data.email_user,
            sidToken: data.sid_token,
        };
    } catch (error) {
        throw new Error('Failed to create temporary email');
    }
};

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

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

export const generateRandomString = (length: number = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const MAILGW_API_URL = 'https://api.mail.gw';

const mailGwApi = axios.create({
    baseURL: MAILGW_API_URL,
});

const setAuthToken = (token: string) => {
    if (token) {
        mailGwApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete mailGwApi.defaults.headers.common['Authorization'];
    }
};

export const getDomains = async () => {
    try {
        const response = await mailGwApi.get('/domains');
        return response.data;
    } catch (error) {
        throw new Error('Error fetching domains');
    }
};

export const createAccount = async (address: string, password: string) => {
    try {
        const response = await mailGwApi.post('/accounts', {
            address,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error('Error creating account');
    }
};

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
        throw new Error('Error logging in');
    }
};

export const getAccountDetails = async (id: string): Promise<Account> => {
    try {
        const response = await mailGwApi.get(`/accounts/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Error getting account details');
    }
};

export const getMessages = async (page = 1): Promise<Email[]> => {
    try {
        const response = await mailGwApi.get('/messages', {
            params: { page }
        });
        return response.data['hydra:member'];
    } catch (error) {
        throw new Error('Error fetching messages');
    }
};

export const getMessage = async (id: string): Promise<Email> => {
    try {
        const response = await mailGwApi.get(`/messages/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching message details');
    }
};

export const deleteMessage = async (id: string): Promise<void> => {
    try {
        await mailGwApi.delete(`/messages/${id}`);
    } catch (error) {
        throw new Error('Error deleting message');
    }
};

export const verifyToken = async (): Promise<boolean> => {
    try {
        await mailGwApi.get('/me');
        return true;
    } catch (error) {
        return false;
    }
};

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

let sid_token = '';
let email_user = '';

export const setSidToken = (token: string) => {
    if (token && token.length > 0) {
        sid_token = token;
        return true;
    }
    return false;
};

export const setEmailUser = (user: string) => {
    if (user && user.length > 0) {
        email_user = user;
        return true;
    }
    return false;
};

export const checkInbox = async () => {
    if (!sessionToken) throw new Error('Session not initialized');

    const res = await axios.get(`${GUERRILLA_BASE_URL}?f=check_email&sid_token=${sessionToken}&seq=0`);

    if (res.data && Array.isArray(res.data.list)) {
        return res.data.list;
    }

    return [];
};

export const fetchEmail = async (emailId: string) => {
    if (!sessionToken) throw new Error('Session not initialized');

    const res = await axios.get(`${GUERRILLA_BASE_URL}?f=fetch_email&sid_token=${sessionToken}&email_id=${emailId}`);

    return res.data;
};

export const setCustomEmailUser = async (username: string) => {
    if (!sessionToken) throw new Error('Session not initialized');

    const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_email_user&email_user=${username}&sid_token=${sessionToken}`);

    const data = res.data;

    if (!data || !data.email_addr) throw new Error('Failed to set username');
    return data;
};

export const setEmailDomain = async (domain: string) => {
    if (!sessionToken) throw new Error('Session not initialized');

    try {
        const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_email_domain&domain_name=${domain}&sid_token=${sessionToken}`);
        const data = res.data;

        if (data && (data.email_addr || data.simulated)) {
            return data;
        }
    } catch (error) {
        try {
            const res = await axios.get(`${GUERRILLA_BASE_URL}?f=set_domain&domain=${domain}&sid_token=${sessionToken}`);
            const data = res.data;

            if (data && (data.email_addr || data.simulated)) {
                return data;
            }
        } catch (secondError) {
            return { simulated: true };
        }
    }

    return { simulated: true };
};

export const forgetMe = async () => {
    try {
        if (!sid_token) {
            return;
        }

        await fetch(`${GUERRILLA_BASE_URL}?f=forget_me&sid_token=${encodeURIComponent(sid_token)}`);

        sid_token = '';
        email_user = '';
    } catch (error) {
        throw new Error('Error forgetting session');
    }
};

export const initializeFromStoredData = ({
    sid_token: token,
    email_user: user
}: { sid_token: string; email_user: string }) => {
    if (!token || !user) return false;

    sessionToken = token;
    sid_token = token;
    email_user = user;

    return true;
};

export const isInitialized = (sid_token: string) => {
    return sessionToken !== null && sessionToken.length > 0;
};


