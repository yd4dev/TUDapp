import { useThemeColor } from '@/hooks/useThemeColor';
import { MaterialIcons } from '@expo/vector-icons';
import CookieManager from '@react-native-cookies/cookies';
import { selectAll, selectOne } from 'css-select';
import { useNavigation } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { parseDocument } from 'htmlparser2';
import React, { useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../../constants/LanguageContext';

// TUfind login URL
const LOGIN_URL = 'https://tufind.hds.hebis.de/Shibboleth.sso/ULBDA?target=https%3A%2F%2Ftufind.hds.hebis.de%2FMyResearch%2FHome%3Fauth_method%3DShibboleth/';

// Helper: Parse loans from HTML using htmlparser2 and css-select
function getText(el: any): string {
  if (!el) return '';
  if (el.type === 'text') return el.data;
  if (el.children) return el.children.map(getText).join('');
  return '';
}

function parseLoans(html: string) {
  const doc = parseDocument(html);
  const items = selectAll('.result-list .result-list-item', doc);
  return items.map(item => {
    // Title
    const titleLinks = selectAll('.title > .title > a.title', item);
    const title = titleLinks.length ? getText(titleLinks[titleLinks.length - 1]).trim() : '';
    // Details block
    const details = selectOne('#title-details', item);
    const detailsText = details ? getText(details) : '';
    const author = detailsText.match(/von:\s*([^\n]+)/)?.[1]?.trim() || '';
    const signature = detailsText.match(/Signatur:\s*([^\n]+)/)?.[1]?.trim() || '';
    const renewCount = detailsText.match(/Verlängert:\s*(\d+)/)?.[1]?.trim() || '';
    const dueDate = detailsText.match(/Rückgabedatum:\s*([\d.]+)/)?.[1]?.trim() || '';
    // Cover image
    const coverImg = selectOne('img.recordcover', item);
    let cover = '';
    if (
      coverImg &&
      typeof coverImg === 'object' &&
      'attribs' in coverImg &&
      (coverImg as any).attribs.src
    ) {
      cover = (coverImg as any).attribs.src;
    }
    return { title, author, signature, renewCount, dueDate, cover };
  });
}

// Function to save return date to calendar
async function saveToCalendar(title: string, dueDate: string) {
  try {
    // Request calendar permissions
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Calendar permission is required to save the return date.');
      return;
    }

    // Parse the due date (format: DD.MM.YYYY)
    const [day, month, year] = dueDate.split('.').map(Number);
    if (!day || !month || !year) {
      Alert.alert('Invalid Date', 'Could not parse the return date.');
      return;
    }

    // Create the event date (end of day)
    const eventDate = new Date(year, month - 1, day, 23, 59, 0);
    
    // Get default calendar
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
    
    if (!defaultCalendar) {
      Alert.alert('No Calendar', 'No calendar found to save the event.');
      return;
    }

    // Create the calendar event
    const eventDetails = {
      title: `Return Book: ${title}`,
      startDate: eventDate,
      endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
      timeZone: 'Europe/Berlin',
      location: 'TU Darmstadt Library',
      notes: `Return book "${title}" to TU Darmstadt Library`,
      alarms: [{ relativeOffset: -60 * 60 * 24 }], // 1 day before
    };

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
    
    if (eventId) {
      Alert.alert('Success', 'Return date saved to calendar!');
    } else {
      Alert.alert('Error', 'Failed to save to calendar.');
    }
  } catch (error) {
    console.error('Error saving to calendar:', error);
    Alert.alert('Error', 'Failed to save to calendar. Please try again.');
  }
}

function LoanCard({ loan, styles }: { loan: any; styles: any }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* No cover image or space for it */}
        <View style={{ flex: 1 }}>
          <Text style={styles.loanTitle}>{loan.title}</Text>
          {loan.author ? <Text style={styles.loanAuthor}>{loan.author}</Text> : null}
          {loan.signature ? <Text style={styles.loanSignature}>{loan.signature}</Text> : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {loan.renewCount !== '' && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="history" size={16} color={styles.loanMeta.color} style={{ marginRight: 4 }} />
              <Text style={styles.loanMeta}>{loan.renewCount}</Text>
            </View>
          )}
          {loan.dueDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
              <MaterialIcons name="event" size={16} color={styles.loanMeta.color} style={{ marginRight: 4 }} />
              <Text style={styles.loanMeta}>{loan.dueDate}</Text>
            </View>
          )}
        </View>
        {loan.dueDate && (
          <TouchableOpacity
            onPress={() => saveToCalendar(loan.title, loan.dueDate)}
            style={styles.calendarButton}
          >
            <MaterialIcons name="event-note" size={20} color={styles.loanMeta.color} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function LoansScreen() {
  const { strings } = useLanguage();
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor({}, 'background');
  const inputBorder = useThemeColor({}, 'icon');
  const placeholderColor = useThemeColor({}, 'icon');
  const errorColor = '#e74c3c'; // You can add this to your Colors if you want
  const buttonColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'icon');
  const styles = getStyles({ backgroundColor, textColor, inputBackground, inputBorder, placeholderColor, errorColor, buttonColor, cardBackground });

  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');

  const webViewRef = React.useRef<any>(null);

  // Track if login JS was injected for the current login page
  const loginInjectionRef = React.useRef<string | null>(null);

  // Track login URL access count
  const loginUrlAccessCountRef = React.useRef(0);
  const LOGIN_URL_THRESHOLD = 10; // has to be at least 5 I think, but let's be safe

  // Track last injected URL to avoid double-injecting
  const lastInjectedUrlRef = React.useRef<string | null>(null);

  const navigation = useNavigation();

  const fallbackTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    navigation.setOptions({
      title: strings.library,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => WebBrowser.openBrowserAsync('https://tufind.hds.hebis.de/Shibboleth.sso/ULBDA?target=https%3A%2F%2Ftufind.hds.hebis.de%2FMyResearch%2FHome%3Fauth_method%3DShibboleth/')}
          style={{ paddingHorizontal: 12 }}
        >
          <MaterialIcons name="open-in-new" size={24} color={textColor} />
        </TouchableOpacity>
      ),
    });

    (async () => {
      const storedUser = await SecureStore.getItemAsync('bib_username');
      const storedPass = await SecureStore.getItemAsync('bib_password');
      setUsername(storedUser || '');
      setPassword(storedPass || '');
      setFormUsername(storedUser || '');
      setFormPassword(storedPass || '');
    })();
  }, [navigation, strings, textColor]);

  // Save credentials
  async function saveCredentials(user: string, pass: string) {
    await SecureStore.setItemAsync('bib_username', user);
    await SecureStore.setItemAsync('bib_password', pass);
  }

  // Automate login in WebView
  function getInjectedJS(user: string, pass: string) {
    return `
      (function() {
        var userField = document.querySelector('input[type=email], input[name*=user], input[name*=User], input[name*=kennung], input[name*=kennung]');
        var passField = document.querySelector('input[type=password]');
        var loginBtn = document.querySelector('#login');
        if (userField && passField) {
          userField.value = '${user.replace(/'/g, "\\'")}';
          passField.value = '${pass.replace(/'/g, "\\'")}';
          if (loginBtn) { loginBtn.click(); }
        }
      })();
    `;
  }

  // Handler for receiving HTML from WebView
  function handleWebViewMessage(event: any) {
    const htmlContent = event.nativeEvent.data;
    console.log('Received HTML from WebView:', htmlContent.slice(0, 500));
    setHtml(htmlContent);
    setLoading(false);
    setShowWebView(false);
    lastInjectedUrlRef.current = null; // Reset for next load
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }

  // Handler for WebView navigation state changes
  function handleWebViewNavigationStateChange(navState: any) {
    console.log('WebView navigation state change:', navState.url, 'loading:', navState.loading);
    // Count accesses to the login URL
    if (navState.url.startsWith("https://idp2.hebis.de/ulb-darmstadt/profile/SAML2/Redirect/SSO")) {
      loginUrlAccessCountRef.current += 1;
      console.log('Login URL access count:', loginUrlAccessCountRef.current);
      if (loginUrlAccessCountRef.current >= LOGIN_URL_THRESHOLD) {
        setShowWebView(false);
        setLoading(false);
        setHtml(null);
        console.log('Login threshold reached, closing WebView.');
        return;
      }
    }
    if (navState.url.startsWith('https://tufind.hds.hebis.de/Shibboleth.sso/SAML2/POST')) {
      console.log('Reached SAML POST page.');
    }
    // Only extract HTML and close WebView if the page is fully loaded and not a SAML POST
    if (
      navState.url.startsWith('https://tufind.hds.hebis.de/MyResearch/Home?auth_method=Shibboleth') &&
      !navState.loading
    ) {
      console.log('Injecting JS to post HTML from MyResearch/Home page:', navState.url);
      setLoading(true);
      webViewRef.current?.injectJavaScript(`window.ReactNativeWebView.postMessage(document.documentElement.outerHTML); true;`);
      setTimeout(() => setShowWebView(false), 500);
    }
  }

  function handleWebViewLoadStart(syntheticEvent: any) {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView onLoadStart:', nativeEvent.url);
  }

  function handleWebViewLoadProgress(syntheticEvent: any) {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView onLoadProgress:', nativeEvent.url, 'progress:', nativeEvent.progress);
    if (
      nativeEvent.url.includes('/MyResearch/Home?auth_method=Shibboleth') &&
      nativeEvent.progress > 0.8 &&
      lastInjectedUrlRef.current !== nativeEvent.url
    ) {
      console.log('Injecting JS to post HTML from onLoadProgress:', nativeEvent.url);
      webViewRef.current?.injectJavaScript(
        "window.ReactNativeWebView.postMessage(document.documentElement.outerHTML); true;"
      );
      lastInjectedUrlRef.current = nativeEvent.url;
    }
  }

  function handleWebViewLoadEnd(syntheticEvent: any) {
    const { nativeEvent } = syntheticEvent;
    const url = nativeEvent.url;
    console.log('WebView onLoadEnd:', url);
    if (
      url.includes('/MyResearch/Home?auth_method=Shibboleth')
    ) {
      console.log('Injecting JS to post HTML from onLoadEnd:', url);
      webViewRef.current?.injectJavaScript(
        "window.ReactNativeWebView.postMessage(document.documentElement.outerHTML); true;"
      );
    }
    // Existing login injection logic
    if (
      url.includes('idp2.hebis.de') &&
      loginInjectionRef.current !== url
    ) {
      loginInjectionRef.current = url;
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(getInjectedJS(username, password));
      }, 300); // Give the page a short time to render before injecting
    }
  }

  const [webViewUrl] = useState(LOGIN_URL);

  // When showing the WebView, clear cookies first and reset login URL access count
  const handleShowWebView = async () => {
    setLoading(true);
    loginUrlAccessCountRef.current = 0;
    try {
      await CookieManager.clearAll(true);
    } catch {}
    setShowWebView(true);
    // Fallback timeout to prevent infinite loading
    fallbackTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setShowWebView(false);
      setHtml(null);
    }, 20000); // 20 seconds fallback
  };

  // Auto-login if credentials are present and not already showing data or loading
  React.useEffect(() => {
    if (
      username && password &&
      !showWebView && !html &&
      loginUrlAccessCountRef.current < LOGIN_URL_THRESHOLD
    ) {
      setFormUsername(username);
      setFormPassword(password);
      setHtml(null);
      loginUrlAccessCountRef.current = 0;
      handleShowWebView();
    }
    // Only run when username/password change or after login threshold reset
  }, [username, password, showWebView, html]);

  // UI
  const showData = !!html;
  const loggedIn = !!username && !!password;
  let loans: any[] = [];
  if (showData && html && !html.includes('Sie haben nichts von uns ausgeliehen.')) {
    loans = parseLoans(html);
    console.log('Parsed loans:', loans.length, loans);
  }

  if (showWebView) {
    // Show loading indicator while WebView is working in the background
    return (
      <View style={styles.webViewContainer}>
        <ActivityIndicator size="large" color={textColor} />
        {/* Hidden WebView for background login/fetch */}
        <View style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}>
          <WebView
            ref={webViewRef}
            source={{ uri: webViewUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            onLoadStart={handleWebViewLoadStart}
            onLoadProgress={handleWebViewLoadProgress}
            onMessage={handleWebViewMessage}
            onLoadEnd={handleWebViewLoadEnd}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            thirdPartyCookiesEnabled
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showData && loggedIn && (
        <View style={styles.loggedInBar}>
          <Text style={styles.loggedInText}>
            {strings.loggedInAs}{username}
          </Text>
          <Button
            title={strings.logout}
            color={errorColor}
            onPress={async () => {
              await SecureStore.deleteItemAsync('bib_username');
              await SecureStore.deleteItemAsync('bib_password');
              setUsername('');
              setPassword('');
              setHtml(null);
              loginUrlAccessCountRef.current = 0;
            }}
          />
        </View>
      )}
      <View style={styles.centeredContent}>
        {showData && (
          html.includes("Sie haben nichts von uns ausgeliehen.") ? (
            <Text style={styles.noLoansText}>{strings.noLoans}</Text>
          ) : (
            <FlatList
              data={loans}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => <LoanCard loan={item} styles={styles} />}
              contentContainerStyle={{ padding: 8, paddingBottom: 32, width: 340 }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              style={{ marginTop: 24, width: 340 }}
              refreshing={loading}
              onRefresh={() => {
                setHtml(null);
                loginUrlAccessCountRef.current = 0;
                handleShowWebView();
              }}
            />
          )
        )}
        {!showData && (
          <View style={styles.loginForm}>
            <Text style={styles.loginTitle}>{strings.loginTitle}</Text>
            <Text style={styles.loginLabel}>{strings.loginUser}</Text>
            <TextInput
              style={styles.input}
              placeholder={strings.loginUser}
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              value={formUsername}
              onChangeText={setFormUsername}
              textContentType="username"
            />
            <Text style={styles.loginLabel}>{strings.loginPass}</Text>
            <TextInput
              style={styles.input}
              placeholder={strings.loginPass}
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={formPassword}
              onChangeText={setFormPassword}
              textContentType="password"
            />
            <Button
              title={strings.loginButton}
              onPress={async () => {
                await saveCredentials(formUsername, formPassword);
                setUsername(formUsername);
                setPassword(formPassword);
                setHtml(null);
                loginUrlAccessCountRef.current = 0;
                handleShowWebView();
              }}
              color={buttonColor}
            />
          </View>
        )}
        {loading && !showWebView && <ActivityIndicator style={{ marginTop: 24 }} size="large" color={textColor} />}
        {!showWebView && !html && loginUrlAccessCountRef.current >= LOGIN_URL_THRESHOLD && (
          <Text style={styles.errorText}>{strings.loginFailed}</Text>
        )}
      </View>
    </View>
  );
}

// Styles as a function of theme colors
const getStyles = ({ backgroundColor, textColor, inputBackground, inputBorder, placeholderColor, errorColor, buttonColor, cardBackground }: {
  backgroundColor: string;
  textColor: string;
  inputBackground: string;
  inputBorder: string;
  placeholderColor: string;
  errorColor: string;
  buttonColor: string;
  cardBackground: string;
}) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor,
    padding: 10,
  },
  webViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor,
  },
  loggedInBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 0,
  },
  loggedInText: {
    color: textColor,
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  noLoansText: {
    color: textColor,
    fontSize: 16,
    marginTop: 24,
  },
  scrollView: {
    marginTop: 24,
    maxHeight: 300,
    backgroundColor: cardBackground,
    borderRadius: 6,
    padding: 8,
    width: 320,
  },
  htmlText: {
    color: textColor,
    fontSize: 10,
  },
  loginForm: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loginTitle: {
    fontSize: 24,
    color: textColor,
    fontWeight: '700',
    marginBottom: 18,
  },
  loginLabel: {
    color: textColor,
    marginBottom: 8,
  },
  input: {
    backgroundColor: inputBackground,
    color: textColor,
    fontSize: 16,
    width: 280,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: inputBorder,
  },
  errorText: {
    color: errorColor,
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: cardBackground,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  coverImg: {
    width: 48,
    height: 64,
    borderRadius: 6,
    marginRight: 0,
    backgroundColor: '#eee',
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: textColor,
    marginBottom: 2,
  },
  loanAuthor: {
    fontSize: 14,
    color: textColor,
    marginBottom: 2,
  },
  loanSignature: {
    fontSize: 13,
    color: cardBackground,
    marginBottom: 2,
  },
  loanMeta: {
    fontSize: 13,
    color: cardBackground,
  },
  calendarButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});
