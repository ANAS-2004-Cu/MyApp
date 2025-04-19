import axios from 'axios';

// Mail.gw API base URL
const API_BASE_URL = 'https://api.mail.gw';

// Interface definitions
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

// Create axios instance with auth interceptor
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Set auth token for all requests after login
const setAuthToken = (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Get available domains
export const getDomains = async () => {
    try {
        const response = await api.get('/domains');
        return response.data;
    } catch (error) {
        console.error('Error fetching domains:', error);
        throw error;
    }
};

// Create a new account
export const createAccount = async (address: string, password: string) => {
    try {
        const response = await api.post('/accounts', {
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
        const response = await api.post('/token', {
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
        const response = await api.get(`/accounts/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error getting account details:', error);
        throw error;
    }
};

// Get messages
export const getMessages = async (page = 1): Promise<Email[]> => {
    try {
        const response = await api.get('/messages', {
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
        const response = await api.get(`/messages/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching message details:', error);
        throw error;
    }
};

// Delete a message
export const deleteMessage = async (id: string): Promise<void> => {
    try {
        await api.delete(`/messages/${id}`);
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
};

// Generate a random string for username
export const generateRandomString = (length: number = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Check if the auth token is still valid
export const verifyToken = async (): Promise<boolean> => {
    try {
        await api.get('/me');
        return true;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
};
