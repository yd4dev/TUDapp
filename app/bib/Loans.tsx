import CookieManager from '@react-native-cookies/cookies';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';

// TUfind login URL
const LOGIN_URL = 'https://tufind.hds.hebis.de/Shibboleth.sso/ULBDA?target=https%3A%2F%2Ftufind.hds.hebis.de%2FMyResearch%2FHome%3Fauth_method%3DShibboleth/';

export default function LoansScreen() {
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Ref for WebView
  const webViewRef = React.useRef<any>(null);

  // Track if login JS was injected for the current login page
  const loginInjectionRef = React.useRef<string | null>(null);

  // Track login URL access count
  const loginUrlAccessCountRef = React.useRef(0);
  const LOGIN_URL_THRESHOLD = 10; // has to be at least 5 I think, but let's be safe

  // Load credentials on mount
  React.useEffect(() => {
    (async () => {
      const storedUser = await SecureStore.getItemAsync('bib_username');
      const storedPass = await SecureStore.getItemAsync('bib_password');
      if (storedUser) setUsername(storedUser);
      if (storedPass) setPassword(storedPass);
    })();
  }, []);

  // Save credentials
  async function saveCredentials(user: string, pass: string) {
    await SecureStore.setItemAsync('bib_username', user);
    await SecureStore.setItemAsync('bib_password', pass);
  }

  // Automate login in WebView
  function getInjectedJS(user: string, pass: string) {
    // Only try to fill and click the login button ONCE per unique page (per URL + form error state)
    return `
      (function() {
        var errorMsg = document.querySelector('.form-error, .alert-danger, .alert-error, .error, #error');
        var loginKey = location.href + (errorMsg ? errorMsg.textContent : '');
        if (window.__tudaLoginTried === loginKey) return;
        window.__tudaLoginTried = loginKey;
        var userField = document.querySelector('input[type=email], input[name*=user], input[name*=User], input[name*=kennung], input[name*=kennung]');
        var passField = document.querySelector('input[type=password]');
        var loginBtn = document.querySelector('#login');
        if (userField && passField) {
          userField.value = '${user.replace(/'/g, "\\'")}';
          passField.value = '${pass.replace(/'/g, "\\'")}';
          if (loginBtn) { loginBtn.click(); }
        }
      })();
      true;
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

  // Only set the initial URL to LOGIN_URL once, then let the WebView handle redirects
  const [webViewUrl] = useState(LOGIN_URL); // Remove setWebViewUrl

  // When showing the WebView, clear cookies first and reset login URL access count
  const handleShowWebView = async () => {
    setLoading(true);
    loginUrlAccessCountRef.current = 0; // Reset counter on every login attempt
    try {
      await CookieManager.clearAll(true);
      // No per-domain clearCookies method exists, so only use clearAll
    } catch {}
    setShowWebView(true);
    setLoading(false);
  };

  // Handler for WebView load end
  function handleWebViewLoadEnd(syntheticEvent: any) {
    const { nativeEvent } = syntheticEvent;
    const url = nativeEvent.url;
    // Only inject on the initial login page, not on error or retry pages
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

  // UI
  if (showWebView) {
    // Show loading indicator while WebView is working in the background
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <ActivityIndicator size="large" color="#fff" />
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'black' }}>
      <Text style={{ fontSize: 24, color: '#fff', fontWeight: '700', marginBottom: 18 }}>Bibliotheks-Login</Text>
      <Text style={{ color: '#fff', marginBottom: 8 }}>TU-ID</Text>
      <TextInput
        style={{ backgroundColor: '#222', color: '#fff', fontSize: 16, width: 280, marginBottom: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333' }}
        placeholder="Benutzername"
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        textContentType="username"
      />
      <Text style={{ color: '#fff', marginBottom: 8 }}>Passwort</Text>
      <TextInput
        style={{ backgroundColor: '#222', color: '#fff', fontSize: 16, width: 280, marginBottom: 20, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333' }}
        placeholder="Passwort"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        textContentType="password"
      />
      <Button
        title="Login & Ausleihen laden"
        onPress={async () => {
          await saveCredentials(username, password);
          handleShowWebView();
        }}
      />
      {loading && <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#fff" />}
      {html && (
        html.includes('Sie haben nichts von uns ausgeliehen.') ? (
          <Text style={{ color: '#fff', fontSize: 16, marginTop: 24 }}>Du hast aktuell keine Ausleihen.</Text>
        ) : (
          <ScrollView style={{ marginTop: 24, maxHeight: 300, backgroundColor: '#111', borderRadius: 6, padding: 8, width: 320 }}>
            <Text style={{ color: '#fff', fontSize: 10 }} selectable>{html}</Text>
          </ScrollView>
        )
      )}
      {!showWebView && !html && loginUrlAccessCountRef.current >= LOGIN_URL_THRESHOLD && (
        <Text style={{ color: 'red', fontSize: 16, marginTop: 24, textAlign: 'center' }}>
          Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten oder versuche es später erneut.
        </Text>
      )}
    </View>
  );
}
