const IS_DEV = process.env.NODE_ENV === 'development' || process.env.APP_VARIANT === 'development';

export default {
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#ffffff",
      "foregroundImage": "./assets/images/adaptive-icon.png"
    },
    "edgeToEdgeEnabled": true,
    "package": IS_DEV ? "com.yd4dev.tudapp.debug" : "com.yd4dev.tudapp",
    "permissions": [
      "android.permission.READ_CALENDAR",
      "android.permission.WRITE_CALENDAR"
    ]
  },
  "experiments": {
    "typedRoutes": true
  },
  "icon": "./assets/images/icon.png",
  "ios": {
    "bundleIdentifier": IS_DEV ? "com.yd4dev.tudapp.debug" : "com.yd4dev.tudapp"
  },
  "name": IS_DEV ? "tudapp-debug" : "tudapp",
  "newArchEnabled": true,
  "orientation": "portrait",
  "plugins": [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#ffffff",
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain"
      }
    ],
    "expo-web-browser",
    [
      "expo-calendar",
      {
        "calendarPermission": "Allow $(PRODUCT_NAME) to access your calendar to save book return dates."
      }
    ],
    [
      'expo-dev-client',
      {
        addGeneratedScheme: !!IS_DEV,
      }
    ]
  ],
  "scheme": "tudapp",
  "slug": IS_DEV ? "tudapp-debug" : "tudapp",
  "userInterfaceStyle": "automatic",
  "version": "1.2.1",
  "web": {
    "bundler": "metro",
    "favicon": "./assets/images/favicon.png",
    "output": "static"
  }
}