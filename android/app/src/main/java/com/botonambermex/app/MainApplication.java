package com.botonambermex.app;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.transistorsoft.rnbackgroundgeolocation.RNBackgroundGeolocation;
import com.transistorsoft.rnbackgroundgeolocation.RNBackgroundGeolocation;
import com.zmxv.RNSound.RNSoundPackage;

import com.brentvatne.react.ReactVideoPackage;
import com.vydia.RNUploader.UploaderReactPackage;
import com.transistorsoft.rnbackgroundgeolocation.RNBackgroundGeolocation;
import com.reactnativecommunity.geolocation.GeolocationPackage;

import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    createNotificationChannel();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            String defName = this.getPackageName();

            CharSequence name = getString(R.string.channel_name);
            String description = getString(R.string.channel_description);
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("alerta_emergencia_mx", name, importance);
            channel.setDescription(description);
            Uri soundUri = Uri.parse("android.resource://"+ defName + "/" + R.raw.alarma);

            AudioAttributes att = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
            channel.enableVibration(true);

            channel.setSound(soundUri, att);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);

            //alerta medica
            CharSequence nameMedical = getString(R.string.channel_name_2);
            String descriptionMedical = getString(R.string.channel_description_2);
            NotificationChannel channelMedical = new NotificationChannel("alerta_medica_mx", nameMedical, importance);
            channelMedical.setDescription(descriptionMedical);

            channelMedical.setSound(soundUri, att);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            notificationManager.createNotificationChannel(channelMedical);

            //notificacion
            NotificationChannel notificationDefault = new NotificationChannel(defName, "Notificaciones", importance);
            notificationDefault.setDescription("Usada para todas las notificaciones en general");

            NotificationChannel notificationOfficialDefault = new NotificationChannel("officials_notifications", "Oficiales", importance);
            notificationOfficialDefault.setDescription("Usada para las notificaciones de usuarios oficiales.");

            NotificationChannel notificationSuspiciousDefault = new NotificationChannel("suspicious_activity_notifications", "Actividad Sospechosa", importance);
            notificationSuspiciousDefault.setDescription("Usada para las notificaciones de actividad sospechosa.");
            Uri soundUriSuspicious = Uri.parse("android.resource://"+ defName + "/" + R.raw.suspicious);
            notificationSuspiciousDefault.setSound(soundUriSuspicious, att);

            notificationManager.createNotificationChannel(notificationDefault);
            notificationManager.createNotificationChannel(notificationOfficialDefault);
            notificationManager.createNotificationChannel(notificationSuspiciousDefault);
        }
    }
  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.alertamxapp.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
