#import "AppDelegate.h"

#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>
#import <CoreLocation/CoreLocation.h>

#if DEBUG
   #ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
   #endif
#endif

@implementation AppDelegate

CLLocationManager *_locationManager;
CLLocation *_newLocation;
NSString *ROOT_URL;

- (void)getLocation
{
  _locationManager = [[CLLocationManager alloc] init];
  _locationManager.delegate = self;
  _locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
  [_locationManager requestAlwaysAuthorization];
  [_locationManager startUpdatingLocation];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations
{
  _newLocation = [locations lastObject];
  [_locationManager stopUpdatingLocation];
}
// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
 [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application
didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  //NSDictionary* Dictionario = [[userInfo objectForKey:@"data"] objectForKey:@"jsonBody"];

  NSString *Type = userInfo[@"notification"][@"data"][@"jsonBody"][@"type"];

  if(Type == nil){
    Type = userInfo[@"data"][@"jsonBody"][@"type"];
  }

  if([Type isEqualToString:@"Silent"]){
    //send user position
    printf("sending location");
    [self getLocation];

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      [self sendUserLocation];
      completionHandler(UIBackgroundFetchResultNewData);
    });
  }
  else{
      [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  }
}
- (bool)sendUserLocation{
  NSString *groupName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"Group_name"];
  NSUserDefaults *defaults = [[NSUserDefaults alloc] init];
  [defaults addSuiteNamed:groupName];

  NSString* token = [[NSUserDefaults standardUserDefaults] objectForKey:@"Token"];

  if(!token){
    token = [defaults objectForKey:@"Token"];
  }

  if(token){
    if(_newLocation!= nil){
      NSString *lat = [[NSNumber numberWithDouble:_newLocation.coordinate.latitude] stringValue];

      NSString *lon = [[NSNumber numberWithDouble:_newLocation.coordinate.longitude] stringValue];

      NSDictionary *coordinatesDict = @{@"Latitude":lat, @"Longitude":lon};

      NSData *jsonBodyData = [NSJSONSerialization dataWithJSONObject:coordinatesDict options:kNilOptions error:nil];

      NSString *locationEndpoint = [ROOT_URL stringByAppendingString:@"/User/UpdateLocation"];

      NSMutableURLRequest *postRequest = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:locationEndpoint]];

      NSString *AuthToken = [NSString stringWithFormat: @"Bearer %@", token];

      [postRequest setValue:AuthToken forHTTPHeaderField:@"Authorization"];

      [postRequest setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];

      [postRequest setHTTPMethod:@"POST"];
      [postRequest setHTTPBody:jsonBodyData];

      NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];

      NSURLSession *session = [NSURLSession sessionWithConfiguration:config
                                                            delegate:nil
                                                       delegateQueue:[NSOperationQueue mainQueue]];

      NSURLSessionDataTask *task = [session dataTaskWithRequest:postRequest
                                              completionHandler:^(NSData * _Nullable data,
                                                                  NSURLResponse * _Nullable response,
                                                                  NSError * _Nullable error) {

                                                  NSHTTPURLResponse *asHTTPResponse = (NSHTTPURLResponse *) response;
                                                  NSLog(@"The response is: %@", asHTTPResponse);

                                              }];
        [task resume];

        return true;

      }

    return false;
  }
  else{
    return false;
  }
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// IOS 10+ Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  completionHandler();
}
// IOS 4-10 Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
 [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *) application
performFetchWithCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  printf("background refresh");
  [self getLocation];

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [self sendUserLocation];
    completionHandler(UIBackgroundFetchResultNewData);
  });
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#if DEBUG
   #ifdef FB_SONARKIT_ENABLED
     InitializeFlipper(application);
   #endif
 #endif
  [AppCenterReactNative register];
  [AppCenterReactNativeAnalytics registerWithInitiallyEnabled:true];
  [AppCenterReactNativeCrashes registerWithAutomaticProcessing];

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"AlertaMXApp"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
      rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
   center.delegate = self;

  [[UIApplication sharedApplication] registerForRemoteNotifications];

  [application setMinimumBackgroundFetchInterval: UIApplicationBackgroundFetchIntervalMinimum];

  ROOT_URL = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"Server_URL"];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
#ifdef FB_SONARKIT_ENABLED
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#endif
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  if([notification.request.content.categoryIdentifier isEqualToString:@"Geofence"])
  {
    completionHandler(UNNotificationPresentationOptionAlert);
  }
  else if([notification.request.content.categoryIdentifier isEqualToString:@"Officials"]){
    NSDictionary *userInfo = notification.request.content.userInfo;
    [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:^void (UIBackgroundFetchResult result){}];
    completionHandler(UNNotificationPresentationOptionAlert);
  }
  else{
    completionHandler(UNNotificationPresentationOptionNone);
  }
}

@end
