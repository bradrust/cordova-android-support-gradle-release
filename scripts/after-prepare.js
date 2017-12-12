const PLUGIN_NAME         = "cordova-android-support-gradle-release";

try{
    var fs = require('fs');
    var path = require('path');
    var parser = require('xml2js');
}catch(e){
  console.log("having trouble with dependencies")
    throw PLUGIN_NAME + ": Failed to load dependencies. If using cordova@6 CLI, ensure this plugin is installed with the --fetch option: " + e.message;
}

const GRADLE_FILENAME = path.resolve(process.cwd(), 'platforms', 'android', 'build.gradle');
const PACKAGE_PATTERN = /(compile "com.android.support:[^:]+:)([^"]+)"/;

console.log("configuration ", GRADLE_FILENAME)
console.log("configuration ", PACKAGE_PATTERN)

// 1. Parse cordova.xml file and fetch this plugin's <variable name="ANDROID_SUPPORT_VERSION" />
fs.readFile(path.resolve(process.cwd(), 'config.xml'), function (err, data) {

  if (err) {
    console.log("read config.xml ERROR ", err)
  } else {
    console.log("read config.xml ", data)
  }

    var json = parser.parseString(data, function (err, result) {
        if (err) {
            return console.log(PLUGIN_NAME, ": ERROR: ", err);
        }
        var plugins = result.widget.plugin;
        if(!plugins || plugins.length === 0) {
          console.log(PLUGIN_NAME, ": WARN: no plugins found");
          return;
        }

/*
    <plugin name="cordova-plugin-android-permissions" spec="^1.0.0" />
    <plugin name="cordova-plugin-app-version" spec="^0.1.9" />
    <plugin name="cordova-plugin-background-mode" spec="^0.7.2" />
    <plugin name="cordova-plugin-console" spec="^1.1.0" />
    <plugin name="cordova-plugin-customurlscheme" spec="^4.3.0">
        <variable name="URL_SCHEME" value="com.businesstechpro.butler" />
        <variable name="ANDROID_SCHEME" value="com.businesstechpro.butler" />
        <variable name="ANDROID_HOST" value="butlerservice-sandbox.auth0.com" />
        <variable name="ANDROID_PATHPREFIX" value="/cordova/com.businesstechpro.butler/callback" />
    </plugin>
    <plugin name="cordova-plugin-device" spec="^1.1.7" />
    <plugin name="cordova-plugin-geolocation" spec="^3.0.0">
        <variable name="GEOLOCATION_USAGE_DESCRIPTION" value="Butler uses your location for ordering and delivery." />
    </plugin>
    <plugin name="cordova-plugin-googlemaps" spec="^2.1.1">
        <variable name="API_KEY_FOR_ANDROID" value="AIzaSyDB2KCdax528ro2sxkXAPLMYVOu8r_cZ3s" />
        <variable name="API_KEY_FOR_ANDROID_JS" value="AIzaSyB1Lr2CnY-suMIPlgorGwMemtHu8a49A3g" />
    </plugin>
    <plugin name="cordova-plugin-mauron85-background-geolocation" spec="https://github.com/bradrust/cordova-plugin-background-geolocation/tarball/master" />
    <plugin name="cordova-plugin-nativeaudio" spec="^3.0.9" />
    <plugin name="cordova-plugin-network-information" spec="^1.3.4" />
    <plugin name="cordova-plugin-safariviewcontroller" spec="^1.4.7" />
    <plugin name="cordova-plugin-settings-hook" spec="^0.2.7" />
    <plugin name="cordova-plugin-splashscreen" spec="^4.1.0" />
    <plugin name="cordova-plugin-statusbar" spec="^2.3.0" />
    <plugin name="cordova-plugin-whitelist" spec="^1.3.3" />
    <plugin name="cordova.plugins.diagnostic" spec="^3.7.1" />
    <plugin name="ionic-plugin-keyboard" spec="^2.2.1" />
    <plugin name="uk.co.workingedge.phonegap.plugin.launchnavigator" spec="^4.0.4" />
    <plugin name="cordova-android-support-gradle-release" spec="https://github.com/bradrust/cordova-android-support-gradle-release/tarball/master">
        <variable name="ANDROID_SUPPORT_VERSION" value="26.+" />
    </plugin>
 */

      console.log(PLUGIN_NAME, ": INFO: ", result);
      console.log(PLUGIN_NAME, ": INFO: ", result.widget);
      console.log(PLUGIN_NAME, ": INFO: ", result.widget.plugin);

        for (var n = 0, len = plugins.length; n < len; n++) {
            var plugin = plugins[n];
            console.log(PLUGIN_NAME, ": INFO: " + plugin.$.name);
            if (plugin.$.name === PLUGIN_NAME) {
                if (!plugin.variable || plugin.variable.length === 0) {
                    return console.log(PLUGIN_NAME, ' Failed to find <variable name="ANDROID_SUPPORT_VERSION" /> in config.xml');
                }
                // 2.  Update .gradle file.
                setGradleVersion(plugin.variable.pop().$.value);
                break;
            }
        }
    });
});

/**
 * Write properties.gradle with:
 *
 ext {
  ANDROID_SUPPORT_VERSION = '<VERSION>'
}
 *
 */
function setGradleVersion(version) {
    fs.readFile(GRADLE_FILENAME, function (err, contents) {
        if (err) {
            return console.log(PLUGIN_NAME, " ERROR: ", err);
        }
        contents = contents.toString();
        fs.writeFile(GRADLE_FILENAME, contents.replace(PACKAGE_PATTERN, "$1" + version + '"'), 'utf8', function (err) {
            if (err) return console.log(PLUGIN_NAME, ": FAILED TO WRITE ", GRADLE_FILENAME, " > ", version, err);
            console.log(PLUGIN_NAME, ": WROTE ", GRADLE_FILENAME, " > ", version);
        });
    });
}





