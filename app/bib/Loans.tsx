import { useThemeColor } from '@/hooks/useThemeColor';
import CookieManager from '@react-native-cookies/cookies';
import { useNavigation } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../../constants/LanguageContext';

// TUfind login URL
const LOGIN_URL = 'https://tufind.hds.hebis.de/Shibboleth.sso/ULBDA?target=https%3A%2F%2Ftufind.hds.hebis.de%2FMyResearch%2FHome%3Fauth_method%3DShibboleth/';

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

  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      title: strings.library,
    });

    (async () => {
      const storedUser = await SecureStore.getItemAsync('bib_username');
      const storedPass = await SecureStore.getItemAsync('bib_password');
      setUsername(storedUser || '');
      setPassword(storedPass || '');
      setFormUsername(storedUser || '');
      setFormPassword(storedPass || '');
    })();
  }, [navigation, strings]);

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
    setHtml(htmlContent);
    setLoading(false);
  }

  // Handler for WebView navigation state changes
  function handleWebViewNavigationStateChange(navState: any) {
    console.log('WebView navigation state change:', navState.url);
    // Count accesses to the login URL
    if (navState.url.startsWith("https://idp2.hebis.de/ulb-darmstadt/profile/SAML2/Redirect/SSO")) {
      loginUrlAccessCountRef.current += 1;
      if (loginUrlAccessCountRef.current >= LOGIN_URL_THRESHOLD) {
        setShowWebView(false);
        setLoading(false);
        setHtml(null);
        return;
      }
    }
    // Do NOT force-submit the SAML POST form; let the page handle it
    // Only extract HTML and close WebView if the page is fully loaded and not a SAML POST
    if (
      (navState.url === 'https://tufind.hds.hebis.de/MyResearch/Home?auth_method=Shibboleth/' ||
       navState.url === 'https://tufind.hds.hebis.de/MyResearch/Home?auth_method=Shibboleth') &&
      !navState.loading
    ) {
      setLoading(true);
      webViewRef.current?.injectJavaScript(`window.ReactNativeWebView.postMessage(document.documentElement.outerHTML); true;`);
      setTimeout(() => setShowWebView(false), 500);
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
    setLoading(false);
  };

  function handleWebViewLoadEnd(syntheticEvent: any) {
    const { nativeEvent } = syntheticEvent;
    const url = nativeEvent.url;
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
            <ScrollView style={styles.scrollView}>
              <Text style={styles.htmlText} selectable>{html}</Text>
            </ScrollView>
          )
        )}
        {showData && (
          <Button
            title={strings.update}
            onPress={() => {
              setHtml(null);
              loginUrlAccessCountRef.current = 0;
              handleShowWebView();
            }}
            color={buttonColor}
          />
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
    padding: 24,
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
    marginBottom: 16,
    marginTop: 8,
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    zIndex: 10,
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
});
