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
  createTempMailLolInbox,
  getTempMailLolStoredData,
  createMaildropAccount,
  getMaildropStoredData,
} from '../utils/tempMailService';
import * as GuerrillaAPI from '../utils/tempMailService';
import { useAlert } from '../context/AlertContext';
import DomainSelectModal from '../components/DomainSelectModal';

const CACHED_EMAILS_SESSION_KEY = 'guerrilla_cached_emails';

const PROVIDER_LABELS: Record<TempMailProvider, string> = {
  [TempMailProvider.MailTM]: 'Mail.TM',
  [TempMailProvider.GuerrillaMail]: 'GuerrillaMail',
  [TempMailProvider.TempMailLol]: 'TempMail.lol',
  [TempMailProvider.Maildrop]: 'Maildrop.cc',
};

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
  const [selectedProvider, setSelectedProvider] = useState<TempMailProvider>(TempMailProvider.MailTM);
  const [existingMailTm, setExistingMailTm] = useState<string | null>(null);
  const [existingGuerrilla, setExistingGuerrilla] = useState<string | null>(null);
  const [existingTempMailLol, setExistingTempMailLol] = useState<string | null>(null);
  const [existingMaildrop, setExistingMaildrop] = useState<string | null>(null);
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

        if (selectedProvider === TempMailProvider.MailTM) {
          await loadDomains();
        } else if (selectedProvider === TempMailProvider.GuerrillaMail) {
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
      const mailTmData =
        (await SecureStore.getItemAsync('mailtm_data')) ||
        (await SecureStore.getItemAsync('mailgw_data'));
      if (mailTmData) {
        const data = JSON.parse(mailTmData);
        setExistingMailTm(data.email);
      }

      const guerrillaData = await SecureStore.getItemAsync('guerrilla_data');
      if (guerrillaData) {
        const data = JSON.parse(guerrillaData);
        setExistingGuerrilla(data.email_addr);
      }

      const tempMailLolData = getTempMailLolStoredData();
      if (tempMailLolData?.address) {
        setExistingTempMailLol(tempMailLolData.address);
      }

      const maildropData = getMaildropStoredData();
      if (maildropData?.email) {
        setExistingMaildrop(maildropData.email);
      }
    } catch {
      showAlert('Error', 'Failed to check existing accounts.');
    }
  };

  const loadDomains = async () => {
    try {
      const domainsData = await getDomains();
      const rawMembers = Array.isArray(domainsData)
        ? domainsData
        : domainsData?.['hydra:member'];
      if (Array.isArray(rawMembers) && rawMembers.length > 0) {
        const domainList = rawMembers.map((domain: any) => domain.domain).filter(Boolean);
        if (domainList.length > 0) {
          setDomains(domainList);
          setSelectedDomain(domainList[0] || '');
          return;
        }
      }
      const fallbackDomains = ['dollicons.com', 'mail.tm'];
      setDomains(fallbackDomains);
      setSelectedDomain(fallbackDomains[0]);
    } catch {
      // Fallback domains in case API fails
      const fallbackDomains = ['dollicons.com', 'mail.tm'];
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
    switch (selectedProvider) {
      case TempMailProvider.MailTM:
        await createMailTmEmail();
        break;
      case TempMailProvider.GuerrillaMail:
        await createGuerrillaEmail();
        break;
      case TempMailProvider.TempMailLol:
        await createTempMailLolEmail();
        break;
      case TempMailProvider.Maildrop:
        await createMaildropEmail();
        break;
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

  const createMailTmEmail = async () => {
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
        'mailtm_data',
        JSON.stringify({
          email,
          password,
          token: authData.token,
          id: authData.id,
        })
      );

      setExistingMailTm(email);

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

  const createTempMailLolEmail = async () => {
    try {
      setLoading(true);
      const data = await createTempMailLolInbox(username);
      setExistingTempMailLol(data.address);

      showAlert('Success', `Email ${data.address} created successfully!`, [
        {
          text: 'Copy Email',
          onPress: () => copyToClipboard(data.address),
        },
        {
          text: 'OK',
        },
      ]);
    } catch {
      showAlert(
        'Error',
        'Failed to create TempMail.lol inbox. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const createMaildropEmail = async () => {
    if (!username.trim()) {
      showAlert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const data = createMaildropAccount(username);
      setExistingMaildrop(data.email);

      showAlert('Success', `Email ${data.email} created successfully!`, [
        {
          text: 'Copy Email',
          onPress: () => copyToClipboard(data.email),
        },
        {
          text: 'OK',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getExistingAddressForProvider = (provider: TempMailProvider): string | null => {
    switch (provider) {
      case TempMailProvider.MailTM:
        return existingMailTm;
      case TempMailProvider.GuerrillaMail:
        return existingGuerrilla;
      case TempMailProvider.TempMailLol:
        return existingTempMailLol;
      case TempMailProvider.Maildrop:
        return existingMaildrop;
    }
  };

  const accessExistingInbox = (provider: TempMailProvider) => {
    if (provider === TempMailProvider.GuerrillaMail) {
      try {
        window.sessionStorage.setItem(
          CACHED_EMAILS_SESSION_KEY,
          JSON.stringify(guerrillaCachedEmails ?? [])
        );
      } catch {
        // Ignore sessionStorage errors
      }
      navigate('/GuerrillaMailInbox');
    } else {
      navigate(`/TempMailInbox?provider=${encodeURIComponent(provider)}`);
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

  const getPreviewEmail = () => {
    switch (selectedProvider) {
      case TempMailProvider.MailTM:
        return `${username}@${selectedDomain}`;
      case TempMailProvider.GuerrillaMail:
        return `${username}@${selectedGuerrillaDomain}`;
      case TempMailProvider.TempMailLol:
        return `${username || 'random'}@(auto-assigned by TempMail.lol)`;
      case TempMailProvider.Maildrop:
        return `${username}@maildrop.cc`;
    }
  };

  const activeExistingEmail = getExistingAddressForProvider(selectedProvider);
  const activeProviderLabel = PROVIDER_LABELS[selectedProvider];

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
            <div style={styles.providerGrid}>
              {(
                [
                  TempMailProvider.MailTM,
                  TempMailProvider.GuerrillaMail,
                  TempMailProvider.TempMailLol,
                  TempMailProvider.Maildrop,
                ] as TempMailProvider[]
              ).map((provider) => {
                const isSelected = selectedProvider === provider;
                return (
                  <button
                    key={provider}
                    type="button"
                    style={{
                      ...styles.providerButton,
                      ...(isSelected ? styles.providerButtonSelected : {}),
                    }}
                    onClick={() => selectProvider(provider)}
                  >
                    <span
                      style={{
                        ...styles.providerButtonText,
                        ...(isSelected ? styles.providerButtonTextSelected : {}),
                      }}
                    >
                      {PROVIDER_LABELS[provider]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Existing Accounts Section */}
          {activeExistingEmail && (
            <div style={styles.existingContainer}>
              <div style={styles.sectionTitle}>
                Existing {activeProviderLabel} Account
              </div>
              <div style={styles.existingEmailCard}>
                <div style={styles.existingEmailContent}>
                  <span style={styles.existingEmailAddress}>
                    {activeExistingEmail}
                  </span>
                </div>
                <div style={styles.existingEmailActions}>
                  <button
                    type="button"
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(activeExistingEmail)}
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
              Create New {activeProviderLabel} Email
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.usernameContainer}>
                <input
                  type="text"
                  style={styles.usernameInput}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedProvider === TempMailProvider.TempMailLol
                      ? 'Optional prefix (or leave random)'
                      : 'Username'
                  }
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

              {selectedProvider === TempMailProvider.MailTM && (
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
              )}

              {selectedProvider === TempMailProvider.GuerrillaMail && (
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

              {selectedProvider === TempMailProvider.Maildrop && (
                <div style={styles.domainSelectorContainer}>
                  <div style={styles.domainSelectorLabel}>Domain:</div>
                  <div style={styles.domainDropdownButton}>
                    <span style={styles.domainDropdownButtonText}>@maildrop.cc</span>
                  </div>
                </div>
              )}

              {/* Preview of the full email */}
              <div style={styles.emailPreview}>
                <div style={styles.emailPreviewLabel}>Your email will be:</div>
                <div style={styles.emailPreviewText}>{getPreviewEmail()}</div>
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
              {'• Mail.TM: Full Hydra inbox with attachment support\n• GuerrillaMail: Multi-domain disposable sessions\n• TempMail.lol: Instant token-based inbox cached locally\n• Maildrop.cc: Instant passwordless GraphQL inbox'}
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
  providerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  providerButton: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #78F0BC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
