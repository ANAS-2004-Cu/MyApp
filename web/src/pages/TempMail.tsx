import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack, IoRefresh, IoChevronUp, IoChevronDown } from 'react-icons/io5';
import { MdContentCopy } from 'react-icons/md';
import * as Clipboard from '../utils/clipboard';
import * as SecureStore from '../utils/storage';
import {
  createAccount,
  login,
  generateRandomString,
  getDomains,
  TempMailProvider,
  GUERRILLA_DOMAINS,
} from '../utils/tempMailService';
import * as GuerrillaAPI from '../utils/tempMailService';
import { useAlert } from '../context/AlertContext';
import DomainSelectModal from '../components/DomainSelectModal';

const CACHED_EMAILS_SESSION_KEY = 'guerrilla_cached_emails';

export default function TempMail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cachedEmailsParam = searchParams.get('cachedEmails');
  const { showAlert } = useAlert();

  const [guerrillaCachedEmails, setGuerrillaCachedEmails] = useState<any[]>(() => {
    try {
      const fromSession = window.sessionStorage.getItem(CACHED_EMAILS_SESSION_KEY);
      if (fromSession) {
        const parsed = JSON.parse(fromSession);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore sessionStorage errors
    }
    return [];
  });

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
    if (cachedEmailsParam) {
      try {
        const parsed = JSON.parse(cachedEmailsParam);
        if (Array.isArray(parsed)) {
          setGuerrillaCachedEmails(parsed);
          window.sessionStorage.setItem(CACHED_EMAILS_SESSION_KEY, JSON.stringify(parsed));
        }
      } catch {
        // Silent error for parsing cached emails
      }
    }
  }, [cachedEmailsParam]);

  useEffect(() => {
    const setup = async () => {
      setIsInitializing(true);
      try {
        await checkExistingAccounts();

        if (selectedProvider === TempMailProvider.MailGW) {
          await loadDomains();
        } else {
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
            await SecureStore.setItemAsync(
              'guerrilla_data',
              JSON.stringify({
                email_addr: emailData.email,
                sid_token: emailData.sidToken,
                email_user: emailData.emailUser,
              })
            );
            setExistingGuerrilla(emailData.email);
          }

          const validDomains = await GuerrillaAPI.testGuerrillaDomains(
            GUERRILLA_DOMAINS,
            emailData.sidToken
          );
          const finalDomains = validDomains.length > 0 ? validDomains : GUERRILLA_DOMAINS;

          setGuerrillaDomains(finalDomains);
          setSelectedGuerrillaDomain(finalDomains[0]);
        }

        generateRandomUsername();
      } catch {
        showAlert('Error', 'Failed to initialize. Please try again later.');
      } finally {
        setIsInitializing(false);
      }
    };

    setup();
  }, [selectedProvider]);

  const checkExistingAccounts = async () => {
    try {
      const mailGwData = await SecureStore.getItemAsync('mailgw_data');
      if (mailGwData) {
        const data = JSON.parse(mailGwData);
        setExistingMailGw(data.email);
      }

      const guerrillaData = await SecureStore.getItemAsync('guerrilla_data');
      if (guerrillaData) {
        const data = JSON.parse(guerrillaData);
        setExistingGuerrilla(data.email_addr);
      }
    } catch {
      showAlert('Error', 'Failed to check existing accounts.');
    }
  };

  const loadDomains = async () => {
    try {
      const domainsData = await getDomains();
      if (domainsData && Array.isArray(domainsData['hydra:member'])) {
        const domainList = domainsData['hydra:member'].map((domain: any) => domain.domain);
        if (domainList.length > 0) {
          setDomains(domainList);
          setSelectedDomain(domainList[0] || '');
          return;
        }
      }
      const fallbackDomains = ['mail.gw', 'mailgw.com'];
      setDomains(fallbackDomains);
      setSelectedDomain(fallbackDomains[0]);
    } catch {
      // Fallback domains in case API fails
      const fallbackDomains = ['mail.gw', 'mailgw.com'];
      setDomains(fallbackDomains);
      setSelectedDomain(fallbackDomains[0]);
    }
  };

  const generateRandomUsername = () => {
    setUsername(generateRandomString(10));
  };

  const selectProvider = (provider: TempMailProvider) => {
    setSelectedProvider(provider);
  };

  const createNewEmail = async () => {
    if (selectedProvider === TempMailProvider.MailGW) {
      await createMailGwEmail();
    } else {
      await createGuerrillaEmail();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showAlert('Success', 'Email address copied to clipboard');
    } catch {
      showAlert('Error', 'Failed to copy to clipboard');
    }
  };

  const createMailGwEmail = async () => {
    try {
      if (!username || !selectedDomain) {
        showAlert('Error', 'Please enter a username and select a domain');
        return;
      }

      setLoading(true);
      const email = `${username}@${selectedDomain}`;
      const password = generateRandomString(12);

      await createAccount(email, password);

      const authData = await login(email, password);

      await SecureStore.setItemAsync(
        'mailgw_data',
        JSON.stringify({
          email,
          password,
          token: authData.token,
          id: authData.id,
        })
      );

      setExistingMailGw(email);

      showAlert('Success', `Email ${email} created successfully!`, [
        {
          text: 'Copy Email',
          onPress: () => copyToClipboard(email),
        },
        {
          text: 'OK',
        },
      ]);
    } catch {
      showAlert(
        'Error',
        'Failed to create email account. The username might be taken or the service is temporarily unavailable.',
        [
          { text: 'Try Again', onPress: generateRandomUsername },
          { text: 'OK' },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const createGuerrillaEmail = async () => {
    try {
      if (!username) {
        showAlert('Error', 'Please enter a username');
        return;
      }

      setLoading(true);

      const emailData = await GuerrillaAPI.getEmailAddress();

      if (!emailData || !emailData.email) {
        throw new Error('Failed to get email address');
      }

      let finalUsername = username;
      let finalDomain = selectedGuerrillaDomain;

      try {
        const userResult = await GuerrillaAPI.setCustomEmailUser(username);
        if (userResult?.email_addr) {
          finalUsername = userResult.email_addr.split('@')[0];
        }
      } catch {
        finalUsername = emailData.emailUser;
      }

      try {
        const domainResult = await GuerrillaAPI.setEmailDomain(selectedGuerrillaDomain);

        if (domainResult?.email_addr) {
          finalDomain = domainResult.email_addr.split('@')[1];
        } else if (domainResult?.simulated) {
          finalDomain = selectedGuerrillaDomain;
        } else {
          finalDomain = emailData.email.split('@')[1];
        }
      } catch {
        finalDomain = emailData.email.split('@')[1];
      }

      const finalEmailAddr = `${finalUsername}@${finalDomain}`;

      await SecureStore.setItemAsync(
        'guerrilla_data',
        JSON.stringify({
          email_addr: finalEmailAddr,
          sid_token: emailData.sidToken,
          email_user: finalUsername,
        })
      );
      setGuerrillaCachedEmails([]);
      try {
        window.sessionStorage.removeItem(CACHED_EMAILS_SESSION_KEY);
      } catch {
        // Ignore sessionStorage error
      }

      setExistingGuerrilla(finalEmailAddr);

      showAlert('Success', `Email ${finalEmailAddr} created successfully!`, [
        {
          text: 'Copy Email',
          onPress: () => copyToClipboard(finalEmailAddr),
        },
        {
          text: 'OK',
        },
      ]);
    } catch {
      showAlert(
        'Error',
        'Failed to create GuerrillaMail account. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const accessExistingInbox = (provider: TempMailProvider) => {
    if (provider === TempMailProvider.MailGW) {
      navigate('/TempMailInbox');
    } else {
      try {
        window.sessionStorage.setItem(
          CACHED_EMAILS_SESSION_KEY,
          JSON.stringify(guerrillaCachedEmails ?? [])
        );
      } catch {
        // Ignore sessionStorage errors
      }
      navigate('/GuerrillaMailInbox');
    }
  };

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setDomainDropdownVisible(false);
  };

  const handleGuerrillaDomainSelect = (domain: string) => {
    setSelectedGuerrillaDomain(domain);
    setGuerrillaDomainDropdownVisible(false);
  };

  const activeDomain =
    selectedProvider === TempMailProvider.MailGW ? selectedDomain : selectedGuerrillaDomain;

  return (
    <div className="app-background">
      <div className="app-viewport" style={styles.container}>
        <div style={styles.scrollContent}>
          <div style={styles.header}>
            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate('/')}
              aria-label="Go Back"
            >
              <IoArrowBack size={24} color="#78F0BC" />
            </button>
            <div style={styles.headerTitle}>Temporary Email</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Provider Selection */}
          <div style={styles.providerContainer}>
            <div style={styles.sectionTitle}>Select Provider</div>
            <div style={styles.providerButtons}>
              <button
                type="button"
                style={{
                  ...styles.providerButton,
                  ...(selectedProvider === TempMailProvider.MailGW
                    ? styles.providerButtonSelected
                    : {}),
                }}
                onClick={() => selectProvider(TempMailProvider.MailGW)}
              >
                <span
                  style={{
                    ...styles.providerButtonText,
                    ...(selectedProvider === TempMailProvider.MailGW
                      ? styles.providerButtonTextSelected
                      : {}),
                  }}
                >
                  Mail.GW
                </span>
              </button>
              <button
                type="button"
                style={{
                  ...styles.providerButton,
                  ...(selectedProvider === TempMailProvider.GuerrillaMail
                    ? styles.providerButtonSelected
                    : {}),
                }}
                onClick={() => selectProvider(TempMailProvider.GuerrillaMail)}
              >
                <span
                  style={{
                    ...styles.providerButtonText,
                    ...(selectedProvider === TempMailProvider.GuerrillaMail
                      ? styles.providerButtonTextSelected
                      : {}),
                  }}
                >
                  GuerrillaMail
                </span>
              </button>
            </div>
          </div>

          {/* Existing Accounts Section */}
          {((selectedProvider === TempMailProvider.MailGW && existingMailGw) ||
            (selectedProvider === TempMailProvider.GuerrillaMail && existingGuerrilla)) && (
            <div style={styles.existingContainer}>
              <div style={styles.sectionTitle}>
                Existing {selectedProvider === TempMailProvider.MailGW ? 'Mail.GW' : 'GuerrillaMail'}{' '}
                Account
              </div>
              <div style={styles.existingEmailCard}>
                <div style={styles.existingEmailContent}>
                  <span style={styles.existingEmailAddress}>
                    {selectedProvider === TempMailProvider.MailGW
                      ? existingMailGw
                      : existingGuerrilla}
                  </span>
                </div>
                <div style={styles.existingEmailActions}>
                  <button
                    type="button"
                    style={styles.iconButton}
                    onClick={() =>
                      copyToClipboard(
                        selectedProvider === TempMailProvider.MailGW
                          ? existingMailGw!
                          : existingGuerrilla!
                      )
                    }
                    aria-label="Copy Email Address"
                  >
                    <MdContentCopy size={24} color="#78F0BC" />
                  </button>
                  <button
                    type="button"
                    style={styles.accessButton}
                    onClick={() => accessExistingInbox(selectedProvider)}
                  >
                    <span style={styles.accessButtonText}>Open Inbox</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create New Email Section */}
          <div style={styles.createContainer}>
            <div style={styles.sectionTitle}>
              Create New{' '}
              {selectedProvider === TempMailProvider.MailGW ? 'Mail.GW' : 'GuerrillaMail'} Email
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.usernameContainer}>
                <input
                  type="text"
                  style={styles.usernameInput}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  style={styles.refreshButton}
                  onClick={generateRandomUsername}
                  aria-label="Generate Random Username"
                >
                  <IoRefresh size={24} color="#78F0BC" />
                </button>
              </div>

              {selectedProvider === TempMailProvider.MailGW ? (
                <div style={styles.domainSelectorContainer}>
                  <div style={styles.domainSelectorLabel}>Select Domain:</div>
                  <button
                    type="button"
                    style={styles.domainDropdownButton}
                    onClick={() => setDomainDropdownVisible(!domainDropdownVisible)}
                  >
                    <span style={styles.domainDropdownButtonText}>@{selectedDomain}</span>
                    {domainDropdownVisible ? (
                      <IoChevronUp size={20} color="#78F0BC" />
                    ) : (
                      <IoChevronDown size={20} color="#78F0BC" />
                    )}
                  </button>

                  <DomainSelectModal
                    visible={domainDropdownVisible}
                    domains={domains}
                    selectedDomain={selectedDomain}
                    onSelect={handleDomainSelect}
                    onClose={() => setDomainDropdownVisible(false)}
                  />
                </div>
              ) : (
                <div style={styles.domainSelectorContainer}>
                  <div style={styles.domainSelectorLabel}>Select Domain:</div>
                  <button
                    type="button"
                    style={styles.domainDropdownButton}
                    onClick={() =>
                      setGuerrillaDomainDropdownVisible(!guerrillaDomainDropdownVisible)
                    }
                  >
                    <span style={styles.domainDropdownButtonText}>@{selectedGuerrillaDomain}</span>
                    {guerrillaDomainDropdownVisible ? (
                      <IoChevronUp size={20} color="#78F0BC" />
                    ) : (
                      <IoChevronDown size={20} color="#78F0BC" />
                    )}
                  </button>

                  <DomainSelectModal
                    visible={guerrillaDomainDropdownVisible}
                    domains={guerrillaDomains}
                    selectedDomain={selectedGuerrillaDomain}
                    onSelect={handleGuerrillaDomainSelect}
                    onClose={() => setGuerrillaDomainDropdownVisible(false)}
                  />
                </div>
              )}

              {/* Preview of the full email */}
              <div style={styles.emailPreview}>
                <div style={styles.emailPreviewLabel}>Your email will be:</div>
                <div style={styles.emailPreviewText}>
                  {username}@{activeDomain}
                </div>
              </div>
            </div>

            <button
              type="button"
              style={styles.createButton}
              onClick={createNewEmail}
              disabled={loading || isInitializing}
            >
              {loading ? (
                <div
                  className="spinner"
                  style={{ width: 20, height: 20, borderTopColor: '#000' }}
                />
              ) : (
                <span style={styles.createButtonText}>Create Email</span>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div style={styles.helpContainer}>
            <div style={styles.helpTitle}>How It Works</div>
            <p style={styles.helpText}>
              Temporary emails are disposable addresses that help protect your privacy online. Use
              them for sign-ups, verifications, or anywhere you don't want to share your real email
              address.
            </p>
            <p style={{ ...styles.helpText, whiteSpace: 'pre-line', marginBottom: 0 }}>
              {'• Mail.GW emails typically last 10 days\n• GuerrillaMail emails typically last a few hours\n• All emails are automatically deleted after expiration'}
            </p>
          </div>
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
  scrollContent: {
    paddingBottom: 40,
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  providerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #78F0BC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  providerButtonSelected: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
  },
  providerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  existingEmailContent: {
    flex: 1,
    overflow: 'hidden',
  },
  existingEmailAddress: {
    color: '#78F0BC',
    fontSize: 14,
    wordBreak: 'break-all',
  },
  existingEmailActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconButton: {
    padding: 5,
    marginRight: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 4,
  },
  accessButtonText: {
    color: '#78F0BC',
    fontWeight: 'bold',
    fontSize: 14,
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
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 12,
  },
  usernameInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    marginRight: 8,
  },
  refreshButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  domainSelectorContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  domainSelectorLabel: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
  },
  domainDropdownButton: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  domainDropdownButtonText: {
    color: '#fff',
    fontSize: 16,
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
    wordBreak: 'break-all',
  },
  createButton: {
    width: '100%',
    backgroundColor: '#78F0BC',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: '20px',
    marginBottom: 8,
  },
};
