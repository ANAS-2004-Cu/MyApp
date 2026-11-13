import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoRefresh, IoMail } from 'react-icons/io5';
import { MdDeleteOutline } from 'react-icons/md';
import { FaInbox } from 'react-icons/fa';
import * as SecureStore from '../utils/storage';
import {
  getMessages,
  Email,
  deleteMessage,
  hydrateMailGwToken,
  setAuthToken,
} from '../utils/tempMailService';
import { useAlert } from '../context/AlertContext';

export default function TempMailInbox() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      hydrateMailGwToken();
      const messages = await getMessages();
      setEmails(messages || []);
    } catch {
      showAlert('Error', 'Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showAlert]);

  useEffect(() => {
    const init = async () => {
      try {
        const storedMailGw = await SecureStore.getItemAsync('mailgw_data');
        if (storedMailGw) {
          const data = JSON.parse(storedMailGw);
          setEmail(data.email);
          if (data.token) {
            setAuthToken(data.token);
          }
          await fetchEmails();
        } else {
          showAlert('Error', 'No active Mail.GW email found. Please create one first.');
          navigate('/TempMail', { replace: true });
        }
      } catch {
        showAlert('Error', 'Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    init();
  }, [fetchEmails, navigate, showAlert]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmails();
  }, [fetchEmails]);

  const handleDeleteEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showAlert('Delete Email', 'Are you sure you want to delete this email?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage(id);
            setEmails((prev) => prev.filter((item) => item.id !== id));
          } catch {
            showAlert('Error', 'Failed to delete email. Please try again.');
          }
        },
      },
    ]);
  };

  const viewEmailDetails = (emailId: string) => {
    navigate(`/EmailDetail?id=${encodeURIComponent(emailId)}&provider=mailgw`);
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

  return (
    <div className="app-background">
      <div className="app-viewport" style={styles.container}>
        <div style={styles.header}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate('/TempMail')}
            aria-label="Go Back"
          >
            <IoArrowBack size={24} color="#78F0BC" />
          </button>
          <div style={styles.headerTitle}>Mail.GW Inbox</div>
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

        {email && (
          <div style={styles.emailBanner}>
            <IoMail size={18} color="#78F0BC" style={{ flexShrink: 0 }} />
            <span style={styles.emailAddress}>{email}</span>
          </div>
        )}

        {loading && !refreshing ? (
          <div style={styles.loadingContainer}>
            <div className="spinner spinner-large" />
            <div style={styles.loadingText}>Loading emails...</div>
          </div>
        ) : emails.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaInbox size={60} color="#78F0BC" style={styles.emptyIcon} />
            <div style={styles.emptyText}>No emails yet</div>
            <div style={styles.emptySubText}>
              New emails will appear here. Pull down to refresh.
            </div>
          </div>
        ) : (
          <div style={styles.emailList}>
            {emails.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                style={styles.emailItem}
                onClick={() => viewEmailDetails(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    viewEmailDetails(item.id);
                  }
                }}
              >
                <div style={styles.senderIcon}>
                  <span style={styles.senderInitial}>
                    {item.from?.name ? item.from.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div style={styles.emailContent}>
                  <div style={styles.emailSender}>
                    {item.from?.name || item.from?.address}
                  </div>
                  <div style={styles.emailSubject}>
                    {item.subject || '(No subject)'}
                  </div>
                  <div style={styles.emailPreview}>
                    {item.intro || '(No content)'}
                  </div>
                </div>
                <div style={styles.emailMeta}>
                  <div style={styles.emailDate}>{formatDate(item.createdAt)}</div>
                  <button
                    type="button"
                    style={styles.deleteIcon}
                    onClick={(e) => handleDeleteEmail(item.id, e)}
                    aria-label="Delete Email"
                  >
                    <MdDeleteOutline size={20} color="#FF6B6B" />
                  </button>
                </div>
              </div>
            ))}
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
};
