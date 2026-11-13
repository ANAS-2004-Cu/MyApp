import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack, IoRefresh, IoMail, IoWarning } from 'react-icons/io5';
import { MdAttachment, MdDeleteOutline } from 'react-icons/md';
import { FaInbox } from 'react-icons/fa';
import * as SecureStore from '../utils/storage';
import * as GuerrillaAPI from '../utils/tempMailService';
import { GuerrillaEmailResponse, GuerrillaAddressData } from '../utils/tempMailService';
import { useAlert } from '../context/AlertContext';

const CACHED_EMAILS_SESSION_KEY = 'guerrilla_cached_emails';

export default function GuerrillaMailInbox() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmailsParam = searchParams.get('initialEmails');
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emailData, setEmailData] = useState<GuerrillaAddressData | null>(null);
  const [tokenInitialized, setTokenInitialized] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  const [emails, setEmails] = useState<GuerrillaEmailResponse[]>(() => {
    try {
      if (initialEmailsParam) {
        const parsed = JSON.parse(initialEmailsParam);
        if (Array.isArray(parsed)) return parsed;
      }
      const fromSession = window.sessionStorage.getItem(CACHED_EMAILS_SESSION_KEY);
      if (fromSession) {
        const parsed = JSON.parse(fromSession);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CACHED_EMAILS_SESSION_KEY, JSON.stringify(emails));
    } catch {
      // Ignore sessionStorage errors
    }
  }, [emails]);

  const saveEmailData = async (data: { email: string; sidToken: string; emailUser: string }) => {
    try {
      const nextData: GuerrillaAddressData = {
        email_addr: data.email,
        sid_token: data.sidToken,
        email_user: data.emailUser,
      };

      setEmailData(nextData);
      await SecureStore.setItemAsync('guerrilla_data', JSON.stringify(nextData));
    } catch {
      showAlert('Error', 'Failed to save email data.');
    }
  };

  const getNewEmailAddress = async () => {
    try {
      setLoading(true);
      setTokenInitialized(false);
      setSessionError(false);

      await SecureStore.deleteItemAsync('guerrilla_data');

      const newAddress = await GuerrillaAPI.getEmailAddress();

      if (newAddress && newAddress.email && newAddress.sidToken) {
        if (!newAddress.emailUser) {
          newAddress.emailUser = newAddress.email.split('@')[0];
        }

        await saveEmailData(newAddress);

        const success = GuerrillaAPI.initializeFromStoredData({
          sid_token: newAddress.sidToken,
          email_user: newAddress.emailUser,
        });

        if (success) {
          setTokenInitialized(true);

          try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const messages = await GuerrillaAPI.checkInbox();
            setEmails(Array.isArray(messages) ? messages : []);
            setSessionError(false);
          } catch {
            // Inbox might be empty
          }

          return newAddress.email;
        } else {
          setSessionError(true);
          return null;
        }
      } else {
        setSessionError(true);
        showAlert('Error', 'Failed to create a new GuerrillaMail address. Please try again later.');
        return null;
      }
    } catch {
      setSessionError(true);
      showAlert('Error', 'Failed to create a new GuerrillaMail address. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setSessionError(false);
        const storedGuerrilla = await SecureStore.getItemAsync('guerrilla_data');

        if (storedGuerrilla) {
          try {
            const data = JSON.parse(storedGuerrilla) as GuerrillaAddressData;
            setEmailData(data);

            if (data.sid_token) {
              if (!data.email_user) {
                data.email_user = data.email_addr.split('@')[0];
              }

              const success = GuerrillaAPI.initializeFromStoredData({
                sid_token: data.sid_token,
                email_user: data.email_user,
              });

              if (success) {
                setTokenInitialized(true);
                await new Promise((resolve) => setTimeout(resolve, 300));
                const messages = await GuerrillaAPI.checkInbox();

                if (Array.isArray(messages)) {
                  setEmails((prevEmails) => {
                    const existingIds = new Set(prevEmails.map((e) => e.mail_id));
                    const newMessages = messages.filter((m) => !existingIds.has(m.mail_id));
                    return newMessages.length > 0 ? [...newMessages, ...prevEmails] : prevEmails;
                  });
                  setSessionError(false);
                } else {
                  throw new Error('Invalid response format');
                }
              } else {
                setSessionError(true);
                await getNewEmailAddress();
              }
            } else {
              setSessionError(true);
              await getNewEmailAddress();
            }
          } catch {
            setSessionError(true);
            await getNewEmailAddress();
          }
        } else {
          await getNewEmailAddress();
        }
      } catch {
        setSessionError(true);
        showAlert(
          'Error',
          'Failed to load email account. Please use the Reset button to get a new address.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const resetEmailAddress = () => {
    showAlert('Reset Email Address', 'Are you sure you want to get a new email address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: async () => {
          try {
            await GuerrillaAPI.forgetMe();
            const newEmail = await getNewEmailAddress();

            if (newEmail) {
              showAlert('Success', `New email address: ${newEmail}`);
            }
          } catch {
            showAlert('Error', 'Failed to reset email address.');
          }
        },
      },
    ]);
  };

  const fetchEmails = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      if (!GuerrillaAPI.isInitialized(emailData?.sid_token || '')) {
        const storedGuerrilla = await SecureStore.getItemAsync('guerrilla_data');
        if (storedGuerrilla) {
          const data = JSON.parse(storedGuerrilla);
          const reInitialized = GuerrillaAPI.initializeFromStoredData({
            sid_token: data.sid_token,
            email_user: data.email_user || data.email_addr.split('@')[0],
          });

          if (!reInitialized) {
            setSessionError(true);
            if (showLoader) {
              showAlert(
                'Session Expired',
                'Your email session has expired. Would you like to get a new email address?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Get New Email', onPress: () => getNewEmailAddress() },
                ]
              );
            }
            return;
          }
        } else {
          setSessionError(true);
          if (showLoader) {
            showAlert(
              'Session Expired',
              'Your email session has expired. Would you like to get a new email address?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Get New Email', onPress: () => getNewEmailAddress() },
              ]
            );
          }
          return;
        }
      }

      try {
        const messages = await GuerrillaAPI.checkInbox();

        if (Array.isArray(messages)) {
          setEmails((prevEmails) => {
            const existingIds = new Set(prevEmails.map((e) => e.mail_id));
            const newMessages = messages.filter((m) => !existingIds.has(m.mail_id));
            return [...newMessages, ...prevEmails];
          });

          setSessionError(false);
          return;
        }
      } catch {
        // Try alternative approach via proxy
      }

      try {
        const url = `${GuerrillaAPI.GUERRILLA_BASE_URL}?f=get_email_address&sid_token=${emailData?.sid_token}`;

        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const messages = await GuerrillaAPI.checkInbox();
          if (Array.isArray(messages)) {
            setEmails(messages);
            setSessionError(false);
            return;
          }
        }
      } catch {
        // Alternative fetch failed
      }

      setSessionError(true);
      setEmails([]);

      if (showLoader) {
        showAlert(
          'Session Error',
          'Failed to fetch emails. Your session may have expired. Please try resetting your session.',
          [
            { text: 'OK' },
            {
              text: 'Reset Session',
              onPress: resetEmailAddress,
            },
          ]
        );
      }
    } catch {
      setSessionError(true);
      if (showLoader) {
        showAlert('Error', 'Failed to load emails. Please try again or reset your session.');
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmails(false);
  }, [tokenInitialized, emailData]);

  const handleDeleteEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showAlert(
      'Delete Email',
      'Are you sure you want to remove this email from your inbox?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEmails((prev) => prev.filter((item) => item.mail_id !== id));
          },
        },
      ]
    );
  };

  const viewEmailDetails = (emailId: string) => {
    navigate(`/EmailDetail?id=${encodeURIComponent(emailId)}&provider=guerrilla`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackToTempMail = () => {
    try {
      window.sessionStorage.setItem(CACHED_EMAILS_SESSION_KEY, JSON.stringify(emails));
    } catch {
      // Ignore sessionStorage errors
    }
    navigate('/TempMail');
  };

  return (
    <div className="app-background">
      <div className="app-viewport" style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button
            type="button"
            style={styles.backButton}
            onClick={handleBackToTempMail}
            aria-label="Go Back"
          >
            <IoArrowBack size={24} color="#78F0BC" />
          </button>
          <div style={styles.headerTitle}>GuerrillaMail Inbox</div>
          <button
            type="button"
            style={styles.refreshButton}
            onClick={onRefresh}
            aria-label="Refresh Inbox"
          >
            <IoRefresh
              size={24}
              color="#78F0BC"
              style={
                refreshing
                  ? { animation: 'spin 0.8s linear infinite' }
                  : undefined
              }
            />
          </button>
        </div>

        {/* Email address banner */}
        {emailData?.email_addr && (
          <div style={styles.emailBanner}>
            <IoMail size={18} color="#78F0BC" style={{ flexShrink: 0 }} />
            <span style={styles.emailAddress}>{emailData.email_addr}</span>
            {sessionError && (
              <div style={styles.errorBadge}>
                <span style={styles.errorBadgeText}>Session Error</span>
              </div>
            )}
          </div>
        )}

        {/* Session error banner */}
        {sessionError && !loading && (
          <button
            type="button"
            style={styles.sessionErrorBanner}
            onClick={resetEmailAddress}
          >
            <IoWarning size={18} color="#FF6B6B" style={{ flexShrink: 0 }} />
            <span style={styles.sessionErrorText}>
              Session error detected. Tap here to reset your session.
            </span>
          </button>
        )}

        {/* Email list */}
        {loading && !refreshing ? (
          <div style={styles.loadingContainer}>
            <div className="spinner spinner-large" />
            <div style={styles.loadingText}>Loading emails...</div>
          </div>
        ) : emails.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaInbox size={60} color="#78F0BC" style={styles.emptyIcon} />
            <div style={styles.emptyText}>
              {sessionError ? 'Session Error' : 'No emails yet'}
            </div>
            <div style={styles.emptySubText}>
              {sessionError
                ? 'Your session may have expired. Try resetting your session.'
                : 'New emails will appear here. Pull down to refresh.'}
            </div>
            {sessionError && (
              <button
                type="button"
                style={styles.resetButton}
                onClick={resetEmailAddress}
              >
                <span style={styles.resetButtonText}>Reset Session</span>
              </button>
            )}
          </div>
        ) : (
          <div style={styles.emailList}>
            {emails.map((item) => {
              let displayName = item.mail_from || '';
              const matches = displayName.match(/(.*)\s<(.*)>/);
              if (matches && matches.length > 1) {
                displayName = matches[1];
              }
              const firstLetter = displayName.charAt(0).toUpperCase();

              return (
                <div
                  key={item.mail_id}
                  role="button"
                  tabIndex={0}
                  style={styles.emailItem}
                  onClick={() => viewEmailDetails(item.mail_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      viewEmailDetails(item.mail_id);
                    }
                  }}
                >
                  <div style={styles.senderIcon}>
                    <span style={styles.senderInitial}>{firstLetter || 'U'}</span>
                  </div>
                  <div style={styles.emailContent}>
                    <div style={styles.emailSender}>{displayName}</div>
                    <div style={styles.emailSubject}>
                      {item.mail_subject || '(No subject)'}
                    </div>
                    <div style={styles.emailPreview}>
                      {item.mail_excerpt || '(No content)'}
                    </div>
                  </div>
                  <div style={styles.emailMeta}>
                    <div style={styles.emailDate}>{formatDate(item.mail_timestamp)}</div>
                    {item.att > 0 && (
                      <MdAttachment
                        size={16}
                        color="#78F0BC"
                        style={styles.attachmentIcon}
                      />
                    )}
                    <button
                      type="button"
                      style={styles.deleteIcon}
                      onClick={(e) => handleDeleteEmail(item.mail_id, e)}
                      aria-label="Delete Email"
                    >
                      <MdDeleteOutline size={20} color="#FF6B6B" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    paddingTop: 40,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: 60,
  },
  backButton: {
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailBanner: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailAddress: {
    fontSize: 14,
    color: '#78F0BC',
    marginLeft: 8,
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  loadingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  emailList: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  emailItem: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    border: '1px solid rgba(120, 240, 188, 0.2)',
    cursor: 'pointer',
  },
  senderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  senderInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78F0BC',
  },
  emailContent: {
    flex: 1,
    minWidth: 0,
  },
  emailSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emailSubject: {
    fontSize: 14,
    color: '#78F0BC',
    marginBottom: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emailPreview: {
    fontSize: 12,
    color: '#ccc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emailMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingLeft: 8,
    flexShrink: 0,
  },
  emailDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  deleteIcon: {
    padding: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentIcon: {
    marginBottom: 5,
  },
  emptyContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 60,
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
    paddingLeft: 40,
    paddingRight: 40,
  },
  sessionErrorBanner: {
    width: '100%',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottom: '1px solid rgba(255, 107, 107, 0.3)',
    textAlign: 'left',
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
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2,
    paddingBottom: 2,
    marginLeft: 8,
  },
  errorBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 8,
    marginTop: 16,
    border: '1px solid #78F0BC',
  },
  resetButtonText: {
    color: '#78F0BC',
    fontWeight: 'bold',
    fontSize: 16,
  },
};
