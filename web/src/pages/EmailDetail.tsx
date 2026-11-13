import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import {
  MdDeleteOutline,
  MdErrorOutline,
  MdContentCopy,
  MdAttachment,
  MdDownload,
} from 'react-icons/md';
import * as Clipboard from '../utils/clipboard';
import * as SecureStore from '../utils/storage';
import {
  getMessage,
  deleteMessage,
  downloadMailGwAttachment,
  hydrateMailGwToken,
} from '../utils/tempMailService';
import * as GuerrillaAPI from '../utils/tempMailService';
import { useAlert } from '../context/AlertContext';

export default function EmailDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const provider = searchParams.get('provider');
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');
  const [showHtml, setShowHtml] = useState(true);

  const isMailGw = provider === 'mailgw';

  const initializeGuerrillaAPI = async () => {
    try {
      const storedGuerrilla = await SecureStore.getItemAsync('guerrilla_data');
      if (storedGuerrilla) {
        const data = JSON.parse(storedGuerrilla);
        GuerrillaAPI.initializeFromStoredData({
          sid_token: data.sid_token,
          email_user: data.email_user || data.email_addr?.split('@')[0] || 'user',
        });
      } else {
        throw new Error('No stored GuerrillaMail session found');
      }
    } catch (error) {
      showAlert('Error', 'Failed to initialize email session. Please try again.');
      throw error;
    }
  };

  const fetchEmailDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      if (isMailGw) {
        hydrateMailGwToken();
        const emailData = await getMessage(id);
        setEmail(emailData);

        const rawHtml = Array.isArray(emailData.html)
          ? emailData.html.join('\n')
          : emailData.html;
        const html = rawHtml || `<div>${emailData.text || 'No content available'}</div>`;
        const text = emailData.text || 'No content available';

        setHtmlContent(html);
        setPlainTextContent(text);
      } else {
        await initializeGuerrillaAPI();
        const emailData = await GuerrillaAPI.fetchEmail(id);

        if (!emailData) {
          throw new Error('Failed to fetch email data');
        }

        setEmail(emailData);

        const html =
          emailData.mail_body ||
          `<div>${emailData.mail_excerpt || 'No content available'}</div>`;
        const text = emailData.mail_body
          ? emailData.mail_body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          : emailData.mail_excerpt || 'No content available';

        setHtmlContent(html);
        setPlainTextContent(text);
      }
    } catch {
      showAlert('Error', 'Failed to load email details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, isMailGw, showAlert]);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      showAlert('Error', 'Invalid email ID');
      navigate(-1);
      return;
    }

    fetchEmailDetails();
  }, [id, provider, fetchEmailDetails, navigate, showAlert]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isMailGw ? '/TempMailInbox' : '/GuerrillaMailInbox');
    }
  };

  const handleDeleteEmail = () => {
    if (!email) return;

    showAlert('Delete Email', 'Are you sure you want to delete this email?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (isMailGw) {
              await deleteMessage(email.id);
              showAlert('Success', 'Email deleted successfully');
            } else {
              showAlert('Success', 'Email removed from view');
            }
            handleBack();
          } catch {
            showAlert('Error', 'Failed to delete email. Please try again.');
          }
        },
      },
    ]);
  };

  const formatDate = (dateValue: string | number) => {
    if (!dateValue) return '';

    const date =
      typeof dateValue === 'string'
        ? new Date(dateValue)
        : new Date(Number(dateValue) * 1000);

    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showAlert('Success', 'Content copied to clipboard');
    } catch {
      showAlert('Error', 'Failed to copy text to clipboard');
    }
  };

  const toggleContentView = () => {
    setShowHtml(!showHtml);
  };

  if (loading) {
    return (
      <div className="app-background">
        <div className="app-viewport" style={styles.container}>
          <div style={styles.header}>
            <button
              type="button"
              style={styles.backButton}
              onClick={handleBack}
              aria-label="Go Back"
            >
              <IoArrowBack size={24} color="#78F0BC" />
            </button>
            <div style={styles.headerTitle}>Loading email...</div>
            <div style={{ width: 30 }} />
          </div>
          <div style={styles.loadingContainer}>
            <div className="spinner spinner-large" />
            <div style={styles.loadingText}>Loading email content...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="app-background">
        <div className="app-viewport" style={styles.container}>
          <div style={styles.header}>
            <button
              type="button"
              style={styles.backButton}
              onClick={handleBack}
              aria-label="Go Back"
            >
              <IoArrowBack size={24} color="#78F0BC" />
            </button>
            <div style={styles.headerTitle}>Error</div>
            <div style={{ width: 30 }} />
          </div>
          <div style={styles.errorContainer}>
            <MdErrorOutline size={60} color="#FF6B6B" />
            <div style={styles.errorText}>Failed to load email</div>
            <button
              type="button"
              style={styles.retryButton}
              onClick={fetchEmailDetails}
            >
              <span style={styles.retryButtonText}>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const emailSubject = isMailGw ? email.subject : email.mail_subject;
  const fromName = isMailGw
    ? email.from?.name || 'Unknown'
    : email.mail_from?.match(/(.*)\s<(.*)>/)
    ? email.mail_from.match(/(.*)\s<(.*)>/)[1]
    : email.mail_from;
  const fromEmail = isMailGw
    ? email.from?.address
    : email.mail_from?.match(/(.*)\s<(.*)>/)
    ? email.mail_from.match(/(.*)\s<(.*)>/)[2]
    : email.mail_from;
  const dateDisplay = formatDate(isMailGw ? email.createdAt : email.mail_timestamp);

  const htmlWrapper = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base target="_blank" rel="noopener noreferrer" />
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        background-color: transparent;
        padding: 10px;
        margin: 0;
        font-size: 16px;
        line-height: 1.5;
        word-break: break-word;
      }
      a { color: #78F0BC; }
      img { max-width: 100%; height: auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #555; padding: 8px; }
    </style>
  </head>
  <body>
    ${htmlContent}
  </body>
</html>`;

  return (
    <div className="app-background">
      <div className="app-viewport" style={styles.container}>
        <div style={styles.header}>
          <button
            type="button"
            style={styles.backButton}
            onClick={handleBack}
            aria-label="Go Back"
          >
            <IoArrowBack size={24} color="#78F0BC" />
          </button>
          <div style={styles.headerTitle}>
            {emailSubject || '(No subject)'}
          </div>
          <button
            type="button"
            style={styles.deleteButton}
            onClick={handleDeleteEmail}
            aria-label="Delete Email"
          >
            <MdDeleteOutline size={24} color="#FF6B6B" />
          </button>
        </div>

        <div style={styles.scrollContainer}>
          <div style={styles.emailMetadata}>
            <div style={styles.senderRow}>
              <div style={styles.senderIcon}>
                <span style={styles.senderInitial}>
                  {(fromName?.charAt(0) || '?').toUpperCase()}
                </span>
              </div>
              <div style={styles.senderInfo}>
                <div style={styles.senderName}>{fromName || 'Unknown'}</div>
                <div style={styles.senderAddress}>{fromEmail || ''}</div>
              </div>
            </div>

            {isMailGw && email.to && (
              <div style={styles.recipientContainer}>
                <span style={styles.recipientLabel}>To: </span>
                <span style={styles.recipientAddress}>
                  {Array.isArray(email.to)
                    ? email.to.map((recipient: any) => recipient.address).join(', ')
                    : ''}
                </span>
              </div>
            )}

            <div style={styles.dateText}>{dateDisplay}</div>
          </div>

          <button
            type="button"
            style={styles.toggleButton}
            onClick={toggleContentView}
          >
            <span style={styles.toggleButtonText}>
              View {showHtml ? 'Plain Text' : 'HTML'}
            </span>
          </button>

          <div style={styles.emailContent}>
            {showHtml ? (
              <iframe
                title="Email Content"
                style={styles.webView}
                srcDoc={htmlWrapper}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
              />
            ) : (
              <div style={styles.plainTextScroll}>
                <div
                  style={styles.plainTextContent}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    copyToClipboard(plainTextContent);
                  }}
                >
                  {plainTextContent || 'No content available'}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            style={styles.copyButton}
            onClick={() => copyToClipboard(plainTextContent)}
          >
            <MdContentCopy size={20} color="#78F0BC" />
            <span style={styles.copyButtonText}>Copy Content</span>
          </button>

          {isMailGw &&
            email.hasAttachments &&
            Array.isArray(email.attachments) &&
            email.attachments.length > 0 && (
              <div style={styles.attachmentsContainer}>
                <div style={styles.attachmentsTitle}>
                  Attachments ({email.attachments.length})
                </div>
                {email.attachments.map((attachment: any, index: number) => (
                  <button
                    key={attachment.id || index}
                    type="button"
                    style={styles.attachmentItem}
                    onClick={async () => {
                      try {
                        await downloadMailGwAttachment(
                          attachment.downloadUrl,
                          attachment.filename || 'attachment'
                        );
                      } catch {
                        showAlert('Error', 'Failed to download attachment');
                      }
                    }}
                  >
                    <MdAttachment size={20} color="#78F0BC" />
                    <div style={styles.attachmentDetails}>
                      <div style={styles.attachmentName}>
                        {attachment.filename || 'Attachment'}
                      </div>
                      <div style={styles.attachmentSize}>
                        {attachment.size
                          ? `${(attachment.size / 1024).toFixed(0)} KB`
                          : ''}
                      </div>
                    </div>
                    <MdDownload size={20} color="#78F0BC" />
                  </button>
                ))}
              </div>
            )}
        </div>
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
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  deleteButton: {
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 24,
  },
  emailMetadata: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderBottom: '1px solid rgba(120, 240, 188, 0.2)',
  },
  senderRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  senderInfo: {
    flex: 1,
    minWidth: 0,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  senderAddress: {
    fontSize: 14,
    color: '#ccc',
    wordBreak: 'break-all',
  },
  recipientContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
  },
  recipientLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  recipientAddress: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    wordBreak: 'break-all',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  toggleButton: {
    alignSelf: 'flex-end',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    margin: 16,
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    borderRadius: 4,
  },
  toggleButtonText: {
    color: '#78F0BC',
    fontSize: 12,
  },
  emailContent: {
    padding: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    margin: 10,
    minHeight: 200,
    overflow: 'hidden',
  },
  webView: {
    width: '100%',
    height: 320,
    border: 'none',
    backgroundColor: 'transparent',
    display: 'block',
  },
  plainTextScroll: {
    padding: 16,
  },
  plainTextContent: {
    color: '#fff',
    fontSize: 16,
    lineHeight: '24px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    userSelect: 'text',
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
  errorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#78F0BC',
    fontSize: 16,
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
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'left',
  },
  attachmentDetails: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    minWidth: 0,
  },
  attachmentName: {
    fontSize: 14,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  copyButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 0,
    marginBottom: 10,
  },
  copyButtonText: {
    color: '#78F0BC',
    marginLeft: 8,
    fontSize: 14,
  },
};
