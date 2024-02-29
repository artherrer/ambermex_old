# Ambermex

## Readme only for Android

### About arturo-060223 branch
  
This branch has been created to fix Android permission issues and replace Google Maps key. In order to run the project, here you will see some instructions.

This branch has removed all Android flavors and you will see only the production enviroment since was unable to run other ones due to documentation missed.

Intructions to run it:

**1.- Install all dependencies and React / React Native libraries**

    yarn install
    
**2.- Simply execute the React Native command through npx**

    npx react-native run-android
    
Add `--variant=release` if you need to compile it for Play Store

**3.- For .aab build just run** 

    cd android && ./gradlew bundleRelease


### Requirements

This changes and compilations has been done through

 - MacOs system (13.4 ) 
 - node v16.18.1 
 - npm 9.6.6
