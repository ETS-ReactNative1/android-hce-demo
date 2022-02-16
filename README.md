<p align="center">
  <img alt="react-native-nfc-rewriter" src="./images/nfc-rewriter-icon.png" width="300">
</p>
<p align="center">
  <h2 align="center">NFC Open ReWriter</h2>
</p>

<br/>

<p align="center">
  <a href='https://apps.apple.com/tw/app/nfc-rewriter/id1551243964' target='_blank'>
  <img alt="react-native-nfc-rewriter" src="./images/Apple-App-Store-Icon.png" width="250">
  </a>
  <a href='https://play.google.com/store/apps/details?id=com.washow.nfcopenrewriter' target='_blank'>
  <img alt="react-native-nfc-rewriter" src="./images/google-play-icon.jpeg" width="250">
  </a>
</p>

<p align="center">
  This open source React Native NFC app allows read & write to NFC tags. 
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/whitedogg13">whitedogg13</a> and <a href="https://github.com/revtel">revteltech</a>
</p>

<table align="center">
<tr>
  <td>
      <img alt="read" src="./images/nfc-app-read.gif" width="200">
      <h3 align="center">Read</h3>
  </td>
  <td>
      <img alt="write" src="./images/nfc-app-write.gif" width="200">
      <h3 align="center">Write</h3>
  </td>
</tr>
</table>

<p align="center">
  And much more! 
</p>

<table align="center">
<tr>
  <td>
      <img alt="trans" src="./images/nfc-app-trans.gif" width="200">
      <h3 align="center">Custom commands</h3>
  </td>
  <td>
      <img alt="mine" src="./images/nfc-app-mine.gif" width="200">
      <h3 align="center">Save Your Own Records</h3>
  </td>
</tr>
</table>

<p align="center">
The NFC library is powered by <a href="https://github.com/facebook/react-native">react-native</a> as well as <a href="https://github.com/whitedogg13/react-native-nfc-manager">react-native-nfc-manager</a>
</p>

## Post-installation steps

After the installation, following changes must be made inside the  ``<projectRoot>/android``:

### aid_list.xml

Create new file `aid_list.xml` in `<projectRoot>/android/app/src/main/res/xml` directory. Create the directory, if it does not exist yet.

- Put the following content to the file:

```xml
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
                   android:description="@string/app_name"
                   android:requireDeviceUnlock="false">
  <aid-group android:category="other"
             android:description="@string/app_name">
    <!-- Create a separate <aid-filer /> node for each NFC application ID, that You intent to emulate/host. -->
    <!-- For the NFC Type 4 tag emulation, let's put "D2760000850101" -->
    <aid-filter android:name="D2760000850101" />
  </aid-group>
</host-apdu-service>
```

### AndroidManifest.xml

Open the app's manifest (``<projectRoot>/android/app/src/main/AndroidManifest.xml``):

- Add permission to use NFC in the application, and add the declaration of usage the HCE feature:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.example.reactnativehce">

    <uses-permission android:name="android.permission.INTERNET" />

    <!-- add this: -->
    <uses-permission android:name="android.permission.NFC" />
    <uses-feature android:name="android.hardware.nfc.hce" android:required="true" />
```

- HCE emulation on the Android platform works as a service. ``react-native-hce`` module communicating with this service, so that's why we need to place the reference in AndroidManifest.

```xml
<application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">

    <!-- ... -->

    <!-- Add the following block: -->
    <service
        android:name="com.reactnativehce.services.CardService"
        android:exported="true"
        android:enabled="false"
        android:permission="android.permission.BIND_NFC_SERVICE" >
        <intent-filter>
          <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
          <category android:name="android.intent.category.DEFAULT"/>
        </intent-filter>

        <meta-data
          android:name="android.nfc.cardemulation.host_apdu_service"
          android:resource="@xml/aid_list" />
    </service>
    <!-- ... -->
</application>
```

That's it.

## Features

- Read NFC tags
  - uid
  - NFC technology
  - NDEF
- Write NDEF
  - RTD_URI
    - url, email, sms, tel, or custom scheme
  - RTD_TEXT
  - WIFI SIMPLE RECORD
- Toolkits
  - NfcA
    - Custom transceive
    - Erase all
    - Format to NDEF
  - IsoDep
    - Custom APDU (mostly Android)
- Save your own records

## Made by

<table>
<tr>
  <td>
      <img alt="revtel" src="./images/revicon_512.png" width="72">
      <h3 align="center">Revteltech</h3>
  </td>
  <td>
      <img alt="washow" src="./images/washow_icon.png" width="72">
      <h3 align="center">Washow</h3>
  </td>
</tr>
</table>
