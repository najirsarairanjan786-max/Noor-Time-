var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);

// server/notifications.ts
var import_express = __toESM(require("express"), 1);
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
var import_messaging = require("firebase-admin/messaging");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0176002567",
  appId: "1:632912827177:web:8986558398214c70d0dd38",
  apiKey: "AIzaSyBeTuy5728fi_JrqhpBuHso7bErLnzqr2o",
  authDomain: "gen-lang-client-0176002567.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-e42ae39e-57a1-4111-ad73-90ee70161bad",
  storageBucket: "gen-lang-client-0176002567.firebasestorage.app",
  messagingSenderId: "632912827177",
  measurementId: "G-N6JSRNQKDT"
};

// server/notifications.ts
var serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
var adminInitialized = false;
try {
  if ((0, import_app.getApps)().length === 0) {
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      (0, import_app.initializeApp)({
        credential: (0, import_app.cert)(serviceAccount),
        projectId: firebase_applet_config_default.projectId
      });
      console.log("Firebase Admin initialized with custom service account.");
    } else {
      (0, import_app.initializeApp)({
        credential: (0, import_app.applicationDefault)(),
        projectId: firebase_applet_config_default.projectId
      });
      console.log("Firebase Admin initialized with applicationDefault.");
    }
  }
  adminInitialized = true;
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}
var router = import_express.default.Router();
router.post("/api/send-notification", async (req, res) => {
  if (!adminInitialized) {
    return res.status(500).json({ error: "Firebase Admin is not initialized. Please provide FIREBASE_SERVICE_ACCOUNT_KEY." });
  }
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required." });
    }
    const db = (0, import_firestore.getFirestore)(firebase_applet_config_default.firestoreDatabaseId);
    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: "Notification not found." });
    }
    const { title, message: message2, category, imageUrl } = notificationDoc.data() || {};
    const usersSnapshot = await db.collection("users").get();
    const userTokens = [];
    for (const userDoc of usersSnapshot.docs) {
      const tokensSnapshot = await userDoc.ref.collection("fcmTokens").get();
      tokensSnapshot.forEach((tokenDoc) => {
        const tokenData = tokenDoc.data();
        if (tokenData && tokenData.token) {
          userTokens.push({
            userId: userDoc.id,
            token: tokenData.token,
            docId: tokenDoc.id
          });
        }
      });
    }
    const uniqueUserTokens = Array.from(
      new Map(userTokens.map((ut) => [ut.token, ut])).values()
    );
    if (uniqueUserTokens.length === 0) {
      await notificationRef.update({
        status: "sent",
        note: "No registered devices found, saved to history"
      });
      return res.status(200).json({
        success: true,
        message: "No registered devices found. Notification saved to history."
      });
    }
    const tokens = uniqueUserTokens.map((ut) => ut.token);
    const payload = {
      notification: {
        title: title || "New Notification",
        body: message2 || "",
        ...imageUrl ? { imageUrl } : {}
      },
      data: {
        category: category || "general",
        title: title || "",
        body: message2 || "",
        ...imageUrl ? { image: imageUrl } : {}
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          defaultSound: true,
          defaultVibrateTimings: true,
          defaultLightSettings: true,
          ...imageUrl ? { imageUrl } : {}
        }
      },
      apns: {
        headers: {
          "apns-priority": "10",
          ...imageUrl ? { "mutable-content": "1" } : {}
        },
        payload: {
          aps: {
            sound: "default"
          }
        },
        ...imageUrl ? { fcmOptions: { imageUrl } } : {}
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          body: message2 || "",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          requireInteraction: true,
          ...imageUrl ? { image: imageUrl } : {}
        }
      },
      tokens
    };
    const response = await (0, import_messaging.getMessaging)().sendEachForMulticast(payload);
    if (response.failureCount > 0) {
      console.log(`${response.failureCount} tokens failed to deliver.`);
      const tokensToDelete = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = uniqueUserTokens[idx];
          const errorCode = resp.error?.code;
          console.warn(`Token failed with error [${errorCode}]: ${failedToken.token}`);
          if (errorCode === "messaging/registration-token-not-registered" || errorCode === "messaging/invalid-registration-token" || errorCode === "messaging/invalid-argument") {
            tokensToDelete.push({
              userId: failedToken.userId,
              docId: failedToken.docId
            });
          }
        }
      });
      if (tokensToDelete.length > 0) {
        console.log(`Cleaning up ${tokensToDelete.length} stale FCM tokens from Firestore...`);
        const batch = db.batch();
        tokensToDelete.forEach((t) => {
          const tokenDocRef = db.collection("users").doc(t.userId).collection("fcmTokens").doc(t.docId);
          batch.delete(tokenDocRef);
        });
        await batch.commit();
        console.log(`FCM tokens cleanup complete.`);
      }
    }
    await notificationRef.update({
      status: "sent",
      successCount: response.successCount,
      failureCount: response.failureCount
    });
    res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${response.successCount} devices!`,
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
var notifications_default = router;

// server/scheduler.ts
var import_node_cron = __toESM(require("node-cron"), 1);
var import_firestore2 = require("firebase-admin/firestore");
var import_messaging2 = require("firebase-admin/messaging");

// node_modules/adhan/lib/esm/Madhab.js
var Madhab = {
  Shafi: "shafi",
  Hanafi: "hanafi"
};
function shadowLength(madhab) {
  switch (madhab) {
    case Madhab.Shafi:
      return 1;
    case Madhab.Hanafi:
      return 2;
    default:
      throw "Invalid Madhab";
  }
}

// node_modules/adhan/lib/esm/HighLatitudeRule.js
var HighLatitudeRule = {
  MiddleOfTheNight: "middleofthenight",
  SeventhOfTheNight: "seventhofthenight",
  TwilightAngle: "twilightangle",
  recommended(coordinates) {
    if (coordinates.latitude > 48) {
      return HighLatitudeRule.SeventhOfTheNight;
    } else {
      return HighLatitudeRule.MiddleOfTheNight;
    }
  }
};
var HighLatitudeRule_default = HighLatitudeRule;

// node_modules/adhan/lib/esm/Coordinates.js
var Coordinates = class {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
};

// node_modules/adhan/lib/esm/Rounding.js
var Rounding = {
  Nearest: "nearest",
  Up: "up",
  None: "none"
};

// node_modules/adhan/lib/esm/DateUtils.js
function dateByAddingDays(date, days) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate() + days;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return new Date(year, month, day, hours, minutes, seconds);
}
function dateByAddingMinutes(date, minutes) {
  return dateByAddingSeconds(date, minutes * 60);
}
function dateByAddingSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1e3);
}
function roundedMinute(date, rounding = Rounding.Nearest) {
  const seconds = date.getUTCSeconds();
  let offset = seconds >= 30 ? 60 - seconds : -1 * seconds;
  if (rounding === Rounding.Up) {
    offset = 60 - seconds;
  } else if (rounding === Rounding.None) {
    offset = 0;
  }
  return dateByAddingSeconds(date, offset);
}
function isLeapYear(year) {
  if (year % 4 !== 0) {
    return false;
  }
  if (year % 100 === 0 && year % 400 !== 0) {
    return false;
  }
  return true;
}
function dayOfYear(date) {
  let returnedDayOfYear = 0;
  const feb = isLeapYear(date.getFullYear()) ? 29 : 28;
  const months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let i = 0; i < date.getMonth(); i++) {
    returnedDayOfYear += months[i];
  }
  returnedDayOfYear += date.getDate();
  return returnedDayOfYear;
}
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.valueOf());
}

// node_modules/adhan/lib/esm/MathUtils.js
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}
function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
}
function normalizeToScale(num, max) {
  return num - max * Math.floor(num / max);
}
function unwindAngle(angle) {
  return normalizeToScale(angle, 360);
}
function quadrantShiftAngle(angle) {
  if (angle >= -180 && angle <= 180) {
    return angle;
  }
  return angle - 360 * Math.round(angle / 360);
}

// node_modules/adhan/lib/esm/Shafaq.js
var Shafaq = {
  // General is a combination of Ahmer and Abyad.
  General: "general",
  // Ahmer means the twilight is the red glow in the sky. Used by the Shafi, Maliki, and Hanbali madhabs.
  Ahmer: "ahmer",
  // Abyad means the twilight is the white glow in the sky. Used by the Hanafi madhab.
  Abyad: "abyad"
};

// node_modules/adhan/lib/esm/Astronomical.js
var Astronomical = {
  /* The geometric mean longitude of the sun in degrees. */
  meanSolarLongitude(julianCentury) {
    const T = julianCentury;
    const term1 = 280.4664567;
    const term2 = 36000.76983 * T;
    const term3 = 3032e-7 * Math.pow(T, 2);
    const L0 = term1 + term2 + term3;
    return unwindAngle(L0);
  },
  /* The geometric mean longitude of the moon in degrees. */
  meanLunarLongitude(julianCentury) {
    const T = julianCentury;
    const term1 = 218.3165;
    const term2 = 481267.8813 * T;
    const Lp = term1 + term2;
    return unwindAngle(Lp);
  },
  ascendingLunarNodeLongitude(julianCentury) {
    const T = julianCentury;
    const term1 = 125.04452;
    const term2 = 1934.136261 * T;
    const term3 = 20708e-7 * Math.pow(T, 2);
    const term4 = Math.pow(T, 3) / 45e4;
    const Omega = term1 - term2 + term3 + term4;
    return unwindAngle(Omega);
  },
  /* The mean anomaly of the sun. */
  meanSolarAnomaly(julianCentury) {
    const T = julianCentury;
    const term1 = 357.52911;
    const term2 = 35999.05029 * T;
    const term3 = 1537e-7 * Math.pow(T, 2);
    const M = term1 + term2 - term3;
    return unwindAngle(M);
  },
  /* The Sun's equation of the center in degrees. */
  solarEquationOfTheCenter(julianCentury, meanAnomaly) {
    const T = julianCentury;
    const Mrad = degreesToRadians(meanAnomaly);
    const term1 = (1.914602 - 4817e-6 * T - 14e-6 * Math.pow(T, 2)) * Math.sin(Mrad);
    const term2 = (0.019993 - 101e-6 * T) * Math.sin(2 * Mrad);
    const term3 = 289e-6 * Math.sin(3 * Mrad);
    return term1 + term2 + term3;
  },
  /* The apparent longitude of the Sun, referred to the
        true equinox of the date. */
  apparentSolarLongitude(julianCentury, meanLongitude) {
    const T = julianCentury;
    const L0 = meanLongitude;
    const longitude = L0 + Astronomical.solarEquationOfTheCenter(T, Astronomical.meanSolarAnomaly(T));
    const Omega = 125.04 - 1934.136 * T;
    const Lambda = longitude - 569e-5 - 478e-5 * Math.sin(degreesToRadians(Omega));
    return unwindAngle(Lambda);
  },
  /* The mean obliquity of the ecliptic, formula
        adopted by the International Astronomical Union.
        Represented in degrees. */
  meanObliquityOfTheEcliptic(julianCentury) {
    const T = julianCentury;
    const term1 = 23.439291;
    const term2 = 0.013004167 * T;
    const term3 = 1639e-10 * Math.pow(T, 2);
    const term4 = 5036e-10 * Math.pow(T, 3);
    return term1 - term2 - term3 + term4;
  },
  /* The mean obliquity of the ecliptic, corrected for
        calculating the apparent position of the sun, in degrees. */
  apparentObliquityOfTheEcliptic(julianCentury, meanObliquityOfTheEcliptic) {
    const T = julianCentury;
    const Epsilon0 = meanObliquityOfTheEcliptic;
    const O = 125.04 - 1934.136 * T;
    return Epsilon0 + 256e-5 * Math.cos(degreesToRadians(O));
  },
  /* Mean sidereal time, the hour angle of the vernal equinox, in degrees. */
  meanSiderealTime(julianCentury) {
    const T = julianCentury;
    const JD = T * 36525 + 2451545;
    const term1 = 280.46061837;
    const term2 = 360.98564736629 * (JD - 2451545);
    const term3 = 387933e-9 * Math.pow(T, 2);
    const term4 = Math.pow(T, 3) / 3871e4;
    const Theta = term1 + term2 + term3 - term4;
    return unwindAngle(Theta);
  },
  nutationInLongitude(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
    const L0 = solarLongitude;
    const Lp = lunarLongitude;
    const Omega = ascendingNode;
    const term1 = -17.2 / 3600 * Math.sin(degreesToRadians(Omega));
    const term2 = 1.32 / 3600 * Math.sin(2 * degreesToRadians(L0));
    const term3 = 0.23 / 3600 * Math.sin(2 * degreesToRadians(Lp));
    const term4 = 0.21 / 3600 * Math.sin(2 * degreesToRadians(Omega));
    return term1 - term2 - term3 + term4;
  },
  nutationInObliquity(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
    const L0 = solarLongitude;
    const Lp = lunarLongitude;
    const Omega = ascendingNode;
    const term1 = 9.2 / 3600 * Math.cos(degreesToRadians(Omega));
    const term2 = 0.57 / 3600 * Math.cos(2 * degreesToRadians(L0));
    const term3 = 0.1 / 3600 * Math.cos(2 * degreesToRadians(Lp));
    const term4 = 0.09 / 3600 * Math.cos(2 * degreesToRadians(Omega));
    return term1 + term2 + term3 - term4;
  },
  altitudeOfCelestialBody(observerLatitude, declination, localHourAngle) {
    const Phi = observerLatitude;
    const delta = declination;
    const H = localHourAngle;
    const term1 = Math.sin(degreesToRadians(Phi)) * Math.sin(degreesToRadians(delta));
    const term2 = Math.cos(degreesToRadians(Phi)) * Math.cos(degreesToRadians(delta)) * Math.cos(degreesToRadians(H));
    return radiansToDegrees(Math.asin(term1 + term2));
  },
  approximateTransit(longitude, siderealTime, rightAscension) {
    const L = longitude;
    const Theta0 = siderealTime;
    const a2 = rightAscension;
    const Lw = L * -1;
    const m0 = normalizeToScale((a2 + Lw - Theta0) / 360, 1);
    const expectedTransit = normalizeToScale((12 - L / 15) / 24, 1);
    if (m0 - expectedTransit > 0.5) {
      return m0 - 1;
    } else if (expectedTransit - m0 > 0.5) {
      return m0 + 1;
    } else {
      return m0;
    }
  },
  /* The time at which the sun is at its highest point in the sky (in universal time) */
  correctedTransit(approximateTransit, longitude, siderealTime, rightAscension, previousRightAscension, nextRightAscension) {
    const m0 = approximateTransit;
    const L = longitude;
    const Theta0 = siderealTime;
    const a2 = rightAscension;
    const a1 = previousRightAscension;
    const a3 = nextRightAscension;
    const Lw = L * -1;
    const Theta = unwindAngle(Theta0 + 360.985647 * m0);
    const a = unwindAngle(Astronomical.interpolateAngles(a2, a1, a3, m0));
    const H = quadrantShiftAngle(Theta - Lw - a);
    const dm = H / -360;
    return (m0 + dm) * 24;
  },
  correctedHourAngle(approximateTransit, angle, coordinates, afterTransit, siderealTime, rightAscension, previousRightAscension, nextRightAscension, declination, previousDeclination, nextDeclination) {
    const m0 = approximateTransit;
    const h0 = angle;
    const Theta0 = siderealTime;
    const a2 = rightAscension;
    const a1 = previousRightAscension;
    const a3 = nextRightAscension;
    const d2 = declination;
    const d1 = previousDeclination;
    const d3 = nextDeclination;
    const Lw = coordinates.longitude * -1;
    const term1 = Math.sin(degreesToRadians(h0)) - Math.sin(degreesToRadians(coordinates.latitude)) * Math.sin(degreesToRadians(d2));
    const term2 = Math.cos(degreesToRadians(coordinates.latitude)) * Math.cos(degreesToRadians(d2));
    const H0 = radiansToDegrees(Math.acos(term1 / term2));
    const m = afterTransit ? m0 + H0 / 360 : m0 - H0 / 360;
    const Theta = unwindAngle(Theta0 + 360.985647 * m);
    const a = unwindAngle(Astronomical.interpolateAngles(a2, a1, a3, m));
    const delta = Astronomical.interpolate(d2, d1, d3, m);
    const H = Theta - Lw - a;
    const h = Astronomical.altitudeOfCelestialBody(coordinates.latitude, delta, H);
    const term3 = h - h0;
    const term4 = 360 * Math.cos(degreesToRadians(delta)) * Math.cos(degreesToRadians(coordinates.latitude)) * Math.sin(degreesToRadians(H));
    const dm = term3 / term4;
    return (m + dm) * 24;
  },
  /* Interpolation of a value given equidistant
        previous and next values and a factor
        equal to the fraction of the interpolated
        point's time over the time between values. */
  interpolate(y2, y1, y3, n) {
    const a = y2 - y1;
    const b = y3 - y2;
    const c = b - a;
    return y2 + n / 2 * (a + b + n * c);
  },
  /* Interpolation of three angles, accounting for
        angle unwinding. */
  interpolateAngles(y2, y1, y3, n) {
    const a = unwindAngle(y2 - y1);
    const b = unwindAngle(y3 - y2);
    const c = b - a;
    return y2 + n / 2 * (a + b + n * c);
  },
  /* The Julian Day for the given Gregorian date components. */
  julianDay(year, month, day, hours = 0) {
    const trunc = Math.trunc;
    const Y = trunc(month > 2 ? year : year - 1);
    const M = trunc(month > 2 ? month : month + 12);
    const D = day + hours / 24;
    const A = trunc(Y / 100);
    const B = trunc(2 - A + trunc(A / 4));
    const i0 = trunc(365.25 * (Y + 4716));
    const i1 = trunc(30.6001 * (M + 1));
    return i0 + i1 + D + B - 1524.5;
  },
  /* Julian century from the epoch. */
  julianCentury(julianDay) {
    return (julianDay - 2451545) / 36525;
  },
  seasonAdjustedMorningTwilight(latitude, dayOfYear2, year, sunrise) {
    const a = 75 + 28.65 / 55 * Math.abs(latitude);
    const b = 75 + 19.44 / 55 * Math.abs(latitude);
    const c = 75 + 32.74 / 55 * Math.abs(latitude);
    const d = 75 + 48.1 / 55 * Math.abs(latitude);
    const adjustment = (function() {
      const dyy = Astronomical.daysSinceSolstice(dayOfYear2, year, latitude);
      if (dyy < 91) {
        return a + (b - a) / 91 * dyy;
      } else if (dyy < 137) {
        return b + (c - b) / 46 * (dyy - 91);
      } else if (dyy < 183) {
        return c + (d - c) / 46 * (dyy - 137);
      } else if (dyy < 229) {
        return d + (c - d) / 46 * (dyy - 183);
      } else if (dyy < 275) {
        return c + (b - c) / 46 * (dyy - 229);
      } else {
        return b + (a - b) / 91 * (dyy - 275);
      }
    })();
    return dateByAddingSeconds(sunrise, Math.round(adjustment * -60));
  },
  seasonAdjustedEveningTwilight(latitude, dayOfYear2, year, sunset, shafaq) {
    let a, b, c, d;
    if (shafaq === Shafaq.Ahmer) {
      a = 62 + 17.4 / 55 * Math.abs(latitude);
      b = 62 - 7.16 / 55 * Math.abs(latitude);
      c = 62 + 5.12 / 55 * Math.abs(latitude);
      d = 62 + 19.44 / 55 * Math.abs(latitude);
    } else if (shafaq === Shafaq.Abyad) {
      a = 75 + 25.6 / 55 * Math.abs(latitude);
      b = 75 + 7.16 / 55 * Math.abs(latitude);
      c = 75 + 36.84 / 55 * Math.abs(latitude);
      d = 75 + 81.84 / 55 * Math.abs(latitude);
    } else {
      a = 75 + 25.6 / 55 * Math.abs(latitude);
      b = 75 + 2.05 / 55 * Math.abs(latitude);
      c = 75 - 9.21 / 55 * Math.abs(latitude);
      d = 75 + 6.14 / 55 * Math.abs(latitude);
    }
    const adjustment = (function() {
      const dyy = Astronomical.daysSinceSolstice(dayOfYear2, year, latitude);
      if (dyy < 91) {
        return a + (b - a) / 91 * dyy;
      } else if (dyy < 137) {
        return b + (c - b) / 46 * (dyy - 91);
      } else if (dyy < 183) {
        return c + (d - c) / 46 * (dyy - 137);
      } else if (dyy < 229) {
        return d + (c - d) / 46 * (dyy - 183);
      } else if (dyy < 275) {
        return c + (b - c) / 46 * (dyy - 229);
      } else {
        return b + (a - b) / 91 * (dyy - 275);
      }
    })();
    return dateByAddingSeconds(sunset, Math.round(adjustment * 60));
  },
  daysSinceSolstice(dayOfYear2, year, latitude) {
    let daysSinceSolstice;
    const northernOffset = 10;
    const southernOffset = isLeapYear(year) ? 173 : 172;
    const daysInYear2 = isLeapYear(year) ? 366 : 365;
    if (latitude >= 0) {
      daysSinceSolstice = dayOfYear2 + northernOffset;
      if (daysSinceSolstice >= daysInYear2) {
        daysSinceSolstice = daysSinceSolstice - daysInYear2;
      }
    } else {
      daysSinceSolstice = dayOfYear2 - southernOffset;
      if (daysSinceSolstice < 0) {
        daysSinceSolstice = daysSinceSolstice + daysInYear2;
      }
    }
    return daysSinceSolstice;
  }
};
var Astronomical_default = Astronomical;

// node_modules/adhan/lib/esm/SolarCoordinates.js
var SolarCoordinates = class {
  constructor(julianDay) {
    const T = Astronomical_default.julianCentury(julianDay);
    const L0 = Astronomical_default.meanSolarLongitude(T);
    const Lp = Astronomical_default.meanLunarLongitude(T);
    const Omega = Astronomical_default.ascendingLunarNodeLongitude(T);
    const Lambda = degreesToRadians(Astronomical_default.apparentSolarLongitude(T, L0));
    const Theta0 = Astronomical_default.meanSiderealTime(T);
    const dPsi = Astronomical_default.nutationInLongitude(T, L0, Lp, Omega);
    const dEpsilon = Astronomical_default.nutationInObliquity(T, L0, Lp, Omega);
    const Epsilon0 = Astronomical_default.meanObliquityOfTheEcliptic(T);
    const EpsilonApparent = degreesToRadians(Astronomical_default.apparentObliquityOfTheEcliptic(T, Epsilon0));
    this.declination = radiansToDegrees(Math.asin(Math.sin(EpsilonApparent) * Math.sin(Lambda)));
    this.rightAscension = unwindAngle(radiansToDegrees(Math.atan2(Math.cos(EpsilonApparent) * Math.sin(Lambda), Math.cos(Lambda))));
    this.apparentSiderealTime = Theta0 + dPsi * 3600 * Math.cos(degreesToRadians(Epsilon0 + dEpsilon)) / 3600;
  }
};

// node_modules/adhan/lib/esm/SolarTime.js
var SolarTime = class {
  constructor(date, coordinates) {
    const julianDay = Astronomical_default.julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0);
    this.observer = coordinates;
    this.solar = new SolarCoordinates(julianDay);
    this.prevSolar = new SolarCoordinates(julianDay - 1);
    this.nextSolar = new SolarCoordinates(julianDay + 1);
    const m0 = Astronomical_default.approximateTransit(coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension);
    const solarAltitude = -50 / 60;
    this.approxTransit = m0;
    this.transit = Astronomical_default.correctedTransit(m0, coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension);
    this.sunrise = Astronomical_default.correctedHourAngle(m0, solarAltitude, coordinates, false, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
    this.sunset = Astronomical_default.correctedHourAngle(m0, solarAltitude, coordinates, true, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
  }
  hourAngle(angle, afterTransit) {
    return Astronomical_default.correctedHourAngle(this.approxTransit, angle, this.observer, afterTransit, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
  }
  afternoon(shadowLength2) {
    const tangent = Math.abs(this.observer.latitude - this.solar.declination);
    const inverse = shadowLength2 + Math.tan(degreesToRadians(tangent));
    const angle = radiansToDegrees(Math.atan(1 / inverse));
    return this.hourAngle(angle, true);
  }
};

// node_modules/adhan/lib/esm/PolarCircleResolution.js
var PolarCircleResolution = {
  AqrabBalad: "AqrabBalad",
  AqrabYaum: "AqrabYaum",
  Unresolved: "Unresolved"
};
var LATITUDE_VARIATION_STEP = 0.5;
var UNSAFE_LATITUDE = 65;
var isValidSolarTime = (solarTime) => !isNaN(solarTime.sunrise) && !isNaN(solarTime.sunset);
var aqrabYaumResolver = (coordinates, date, daysAdded = 1, direction = 1) => {
  if (daysAdded > Math.ceil(365 / 2)) {
    return null;
  }
  const testDate = new Date(date.getTime());
  testDate.setDate(testDate.getDate() + direction * daysAdded);
  const tomorrow = dateByAddingDays(testDate, 1);
  const solarTime = new SolarTime(testDate, coordinates);
  const tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
  if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
    return aqrabYaumResolver(coordinates, date, daysAdded + (direction > 0 ? 0 : 1), -direction);
  }
  return {
    date,
    tomorrow,
    coordinates,
    solarTime,
    tomorrowSolarTime
  };
};
var aqrabBaladResolver = (coordinates, date, latitude) => {
  const solarTime = new SolarTime(date, {
    ...coordinates,
    latitude
  });
  const tomorrow = dateByAddingDays(date, 1);
  const tomorrowSolarTime = new SolarTime(tomorrow, {
    ...coordinates,
    latitude
  });
  if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
    return Math.abs(latitude) >= UNSAFE_LATITUDE ? aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) : null;
  }
  return {
    date,
    tomorrow,
    coordinates: new Coordinates(latitude, coordinates.longitude),
    solarTime,
    tomorrowSolarTime
  };
};
var polarCircleResolvedValues = (resolver, date, coordinates) => {
  const defaultReturn = {
    date,
    tomorrow: dateByAddingDays(date, 1),
    coordinates,
    solarTime: new SolarTime(date, coordinates),
    tomorrowSolarTime: new SolarTime(dateByAddingDays(date, 1), coordinates)
  };
  switch (resolver) {
    case PolarCircleResolution.AqrabYaum: {
      return aqrabYaumResolver(coordinates, date) || defaultReturn;
    }
    case PolarCircleResolution.AqrabBalad: {
      const {
        latitude
      } = coordinates;
      return aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) || defaultReturn;
    }
    default: {
      return defaultReturn;
    }
  }
};

// node_modules/adhan/lib/esm/CalculationParameters.js
var CalculationParameters = class {
  // Madhab to determine how Asr is calculated.
  madhab = Madhab.Shafi;
  // Rule to determine the earliest time for Fajr and latest time for Isha
  // needed for high latitude locations where Fajr and Isha may not truly exist
  // or may present a hardship unless bound to a reasonable time.
  highLatitudeRule = HighLatitudeRule_default.MiddleOfTheNight;
  // Manual adjustments (in minutes) to be added to each prayer time.
  adjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  };
  // Adjustments set by a calculation method. This value should not be manually modified.
  methodAdjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  };
  // Rule to determine how to resolve prayer times inside the Polar Circle
  // where daylight or night may persist for more than 24 hours depending
  // on the season
  polarCircleResolution = PolarCircleResolution.Unresolved;
  // How seconds are rounded when calculating prayer times
  rounding = Rounding.Nearest;
  // Used by the MoonsightingCommittee method to determine how to calculate Isha
  shafaq = Shafaq.General;
  constructor(method, fajrAngle = 0, ishaAngle = 0, ishaInterval = 0, maghribAngle = 0) {
    this.method = method;
    this.fajrAngle = fajrAngle;
    this.ishaAngle = ishaAngle;
    this.ishaInterval = ishaInterval;
    this.maghribAngle = maghribAngle;
    if (this.method === null) {
      this.method = "Other";
    }
  }
  nightPortions() {
    switch (this.highLatitudeRule) {
      case HighLatitudeRule_default.MiddleOfTheNight:
        return {
          fajr: 1 / 2,
          isha: 1 / 2
        };
      case HighLatitudeRule_default.SeventhOfTheNight:
        return {
          fajr: 1 / 7,
          isha: 1 / 7
        };
      case HighLatitudeRule_default.TwilightAngle:
        return {
          fajr: this.fajrAngle / 60,
          isha: this.ishaAngle / 60
        };
      default:
        throw `Invalid high latitude rule found when attempting to compute night portions: ${this.highLatitudeRule}`;
    }
  }
};

// node_modules/adhan/lib/esm/CalculationMethod.js
var CalculationMethod = {
  // Muslim World League
  MuslimWorldLeague() {
    const params = new CalculationParameters("MuslimWorldLeague", 18, 17);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // Egyptian General Authority of Survey
  Egyptian() {
    const params = new CalculationParameters("Egyptian", 19.5, 17.5);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // University of Islamic Sciences, Karachi
  Karachi() {
    const params = new CalculationParameters("Karachi", 18, 18);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // Umm al-Qura University, Makkah
  UmmAlQura() {
    return new CalculationParameters("UmmAlQura", 18.5, 0, 90);
  },
  // Dubai
  Dubai() {
    const params = new CalculationParameters("Dubai", 18.2, 18.2);
    params.methodAdjustments = {
      ...params.methodAdjustments,
      sunrise: -3,
      dhuhr: 3,
      asr: 3,
      maghrib: 3
    };
    return params;
  },
  // Moonsighting Committee
  MoonsightingCommittee() {
    const params = new CalculationParameters("MoonsightingCommittee", 18, 18);
    params.methodAdjustments = {
      ...params.methodAdjustments,
      dhuhr: 5,
      maghrib: 3
    };
    return params;
  },
  // ISNA
  NorthAmerica() {
    const params = new CalculationParameters("NorthAmerica", 15, 15);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // Kuwait
  Kuwait() {
    return new CalculationParameters("Kuwait", 18, 17.5);
  },
  // Qatar
  Qatar() {
    return new CalculationParameters("Qatar", 18, 0, 90);
  },
  // Singapore
  Singapore() {
    const params = new CalculationParameters("Singapore", 20, 18);
    params.methodAdjustments.dhuhr = 1;
    params.rounding = Rounding.Up;
    return params;
  },
  // Institute of Geophysics, University of Tehran
  Tehran() {
    const params = new CalculationParameters("Tehran", 17.7, 14, 0, 4.5);
    return params;
  },
  // Dianet
  Turkey() {
    const params = new CalculationParameters("Turkey", 18, 17);
    params.methodAdjustments = {
      ...params.methodAdjustments,
      sunrise: -7,
      dhuhr: 5,
      asr: 4,
      maghrib: 7
    };
    return params;
  },
  // Other
  Other() {
    return new CalculationParameters("Other", 0, 0);
  }
};
var CalculationMethod_default = CalculationMethod;

// node_modules/adhan/lib/esm/Prayer.js
var Prayer = {
  Fajr: "fajr",
  Sunrise: "sunrise",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
  None: "none"
};
var Prayer_default = Prayer;

// node_modules/adhan/lib/esm/TimeComponents.js
var TimeComponents = class {
  constructor(num) {
    this.hours = Math.floor(num);
    this.minutes = Math.floor((num - this.hours) * 60);
    this.seconds = Math.floor((num - (this.hours + this.minutes / 60)) * 60 * 60);
    return this;
  }
  utcDate(year, month, date) {
    return new Date(Date.UTC(year, month, date, this.hours, this.minutes, this.seconds));
  }
};

// node_modules/adhan/lib/esm/PrayerTimes.js
var PrayerTimes = class {
  constructor(coordinates, date, calculationParameters) {
    this.coordinates = coordinates;
    this.date = date;
    this.calculationParameters = calculationParameters;
    let solarTime = new SolarTime(date, coordinates);
    let fajrTime;
    let sunriseTime;
    let dhuhrTime;
    let asrTime;
    let sunsetTime;
    let maghribTime;
    let ishaTime;
    let nightFraction;
    dhuhrTime = new TimeComponents(solarTime.transit).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    sunriseTime = new TimeComponents(solarTime.sunrise).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    sunsetTime = new TimeComponents(solarTime.sunset).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    const tomorrow = dateByAddingDays(date, 1);
    let tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
    const polarCircleResolver = calculationParameters.polarCircleResolution;
    if ((!isValidDate(sunriseTime) || !isValidDate(sunsetTime) || isNaN(tomorrowSolarTime.sunrise)) && polarCircleResolver !== PolarCircleResolution.Unresolved) {
      const resolved = polarCircleResolvedValues(polarCircleResolver, date, coordinates);
      solarTime = resolved.solarTime;
      tomorrowSolarTime = resolved.tomorrowSolarTime;
      const dateComponents = [date.getFullYear(), date.getMonth(), date.getDate()];
      dhuhrTime = new TimeComponents(solarTime.transit).utcDate(...dateComponents);
      sunriseTime = new TimeComponents(solarTime.sunrise).utcDate(...dateComponents);
      sunsetTime = new TimeComponents(solarTime.sunset).utcDate(...dateComponents);
    }
    asrTime = new TimeComponents(solarTime.afternoon(shadowLength(calculationParameters.madhab))).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    const tomorrowSunrise = new TimeComponents(tomorrowSolarTime.sunrise).utcDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const night = (Number(tomorrowSunrise) - Number(sunsetTime)) / 1e3;
    fajrTime = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.fajrAngle, false)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= 55) {
      nightFraction = night / 7;
      fajrTime = dateByAddingSeconds(sunriseTime, -nightFraction);
    }
    const safeFajr = (function() {
      if (calculationParameters.method === "MoonsightingCommittee") {
        return Astronomical_default.seasonAdjustedMorningTwilight(coordinates.latitude, dayOfYear(date), date.getFullYear(), sunriseTime);
      } else {
        const portion = calculationParameters.nightPortions().fajr;
        nightFraction = portion * night;
        return dateByAddingSeconds(sunriseTime, -nightFraction);
      }
    })();
    if (isNaN(fajrTime.getTime()) || safeFajr > fajrTime) {
      fajrTime = safeFajr;
    }
    if (calculationParameters.ishaInterval > 0) {
      ishaTime = dateByAddingMinutes(sunsetTime, calculationParameters.ishaInterval);
    } else {
      ishaTime = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.ishaAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= 55) {
        nightFraction = night / 7;
        ishaTime = dateByAddingSeconds(sunsetTime, nightFraction);
      }
      const safeIsha = (function() {
        if (calculationParameters.method === "MoonsightingCommittee") {
          return Astronomical_default.seasonAdjustedEveningTwilight(coordinates.latitude, dayOfYear(date), date.getFullYear(), sunsetTime, calculationParameters.shafaq);
        } else {
          const portion = calculationParameters.nightPortions().isha;
          nightFraction = portion * night;
          return dateByAddingSeconds(sunsetTime, nightFraction);
        }
      })();
      if (isNaN(ishaTime.getTime()) || safeIsha < ishaTime) {
        ishaTime = safeIsha;
      }
    }
    maghribTime = sunsetTime;
    if (calculationParameters.maghribAngle) {
      const angleBasedMaghrib = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.maghribAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      if (sunsetTime < angleBasedMaghrib && ishaTime > angleBasedMaghrib) {
        maghribTime = angleBasedMaghrib;
      }
    }
    const fajrAdjustment = (calculationParameters.adjustments.fajr || 0) + (calculationParameters.methodAdjustments.fajr || 0);
    const sunriseAdjustment = (calculationParameters.adjustments.sunrise || 0) + (calculationParameters.methodAdjustments.sunrise || 0);
    const dhuhrAdjustment = (calculationParameters.adjustments.dhuhr || 0) + (calculationParameters.methodAdjustments.dhuhr || 0);
    const asrAdjustment = (calculationParameters.adjustments.asr || 0) + (calculationParameters.methodAdjustments.asr || 0);
    const maghribAdjustment = (calculationParameters.adjustments.maghrib || 0) + (calculationParameters.methodAdjustments.maghrib || 0);
    const ishaAdjustment = (calculationParameters.adjustments.isha || 0) + (calculationParameters.methodAdjustments.isha || 0);
    this.fajr = roundedMinute(dateByAddingMinutes(fajrTime, fajrAdjustment), calculationParameters.rounding);
    this.sunrise = roundedMinute(dateByAddingMinutes(sunriseTime, sunriseAdjustment), calculationParameters.rounding);
    this.dhuhr = roundedMinute(dateByAddingMinutes(dhuhrTime, dhuhrAdjustment), calculationParameters.rounding);
    this.asr = roundedMinute(dateByAddingMinutes(asrTime, asrAdjustment), calculationParameters.rounding);
    this.sunset = roundedMinute(sunsetTime, calculationParameters.rounding);
    this.maghrib = roundedMinute(dateByAddingMinutes(maghribTime, maghribAdjustment), calculationParameters.rounding);
    this.isha = roundedMinute(dateByAddingMinutes(ishaTime, ishaAdjustment), calculationParameters.rounding);
  }
  timeForPrayer(prayer) {
    if (prayer === Prayer_default.Fajr) {
      return this.fajr;
    } else if (prayer === Prayer_default.Sunrise) {
      return this.sunrise;
    } else if (prayer === Prayer_default.Dhuhr) {
      return this.dhuhr;
    } else if (prayer === Prayer_default.Asr) {
      return this.asr;
    } else if (prayer === Prayer_default.Maghrib) {
      return this.maghrib;
    } else if (prayer === Prayer_default.Isha) {
      return this.isha;
    } else {
      return null;
    }
  }
  currentPrayer(date = /* @__PURE__ */ new Date()) {
    if (date >= this.isha) {
      return Prayer_default.Isha;
    } else if (date >= this.maghrib) {
      return Prayer_default.Maghrib;
    } else if (date >= this.asr) {
      return Prayer_default.Asr;
    } else if (date >= this.dhuhr) {
      return Prayer_default.Dhuhr;
    } else if (date >= this.sunrise) {
      return Prayer_default.Sunrise;
    } else if (date >= this.fajr) {
      return Prayer_default.Fajr;
    } else {
      return Prayer_default.None;
    }
  }
  nextPrayer(date = /* @__PURE__ */ new Date()) {
    if (date >= this.isha) {
      return Prayer_default.None;
    } else if (date >= this.maghrib) {
      return Prayer_default.Isha;
    } else if (date >= this.asr) {
      return Prayer_default.Maghrib;
    } else if (date >= this.dhuhr) {
      return Prayer_default.Asr;
    } else if (date >= this.sunrise) {
      return Prayer_default.Dhuhr;
    } else if (date >= this.fajr) {
      return Prayer_default.Sunrise;
    } else {
      return Prayer_default.Fajr;
    }
  }
};

// node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var millisecondsInMinute = 6e4;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = Symbol.for("constructDateFrom");

// node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date) return new date.constructor(value);
  return new Date(value);
}

// node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}

// node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfISOWeek.js
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}

// node_modules/date-fns/getISOWeekYear.js
function getISOWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

// node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object")
  );
  return dates.map(normalize);
}

// node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/differenceInCalendarDays.js
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);
  const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}

// node_modules/date-fns/startOfISOWeekYear.js
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// node_modules/date-fns/addMinutes.js
function addMinutes(date, amount, options) {
  const _date = toDate(date, options?.in);
  _date.setTime(_date.getTime() + amount * millisecondsInMinute);
  return _date;
}

// node_modules/date-fns/isDate.js
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/isValid.js
function isValid(date) {
  return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}

// node_modules/date-fns/startOfYear.js
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// node_modules/date-fns/locale/en-US/_lib/formatDistance.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format4 = args.formats[width] || args.formats[args.defaultWidth];
    return format4;
  };
}

// node_modules/date-fns/locale/en-US/_lib/formatLong.js
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// node_modules/date-fns/locale/_lib/buildLocalizeFn.js
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}

// node_modules/date-fns/locale/en-US/_lib/localize.js
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.js
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // [TODO] -- I challenge you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // [TODO] -- I challenge you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// node_modules/date-fns/locale/en-US/_lib/match.js
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.js
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// node_modules/date-fns/getDayOfYear.js
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear2 = diff + 1;
  return dayOfYear2;
}

// node_modules/date-fns/getISOWeek.js
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/getWeekYear.js
function getWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfWeekYear.js
function startOfWeekYear(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// node_modules/date-fns/getWeek.js
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// node_modules/date-fns/_lib/format/lightFormatters.js
var lightFormatters = {
  // Year
  y(date, token) {
    const signedYear = date.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },
  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },
  // Minute
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },
  // Second
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },
  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3)
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.js
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function(date, token, localize2) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return localize2.era(era, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return localize2.era(era, { width: "wide" });
    }
  },
  // Year
  y: function(date, token, localize2) {
    if (token === "yo") {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date, token);
  },
  // Local week-numbering year
  Y: function(date, token, localize2, options) {
    const signedWeekYear = getWeekYear(date, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function(date, token) {
    const isoWeekYear = getISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
        return String(quarter);
      // 01, 02, 03, 04
      case "QQ":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "q":
        return String(quarter);
      // 01, 02, 03, 04
      case "qq":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return localize2.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      // J, F, ..., D
      case "MMMMM":
        return localize2.month(month, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return localize2.month(month, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return String(month + 1);
      // 01, 02, ..., 12
      case "LL":
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return localize2.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      // J, F, ..., D
      case "LLLLL":
        return localize2.month(month, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return localize2.month(month, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(date, token, localize2, options) {
    const week = getWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function(date, token, localize2) {
    const isoWeek = getISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date, token);
  },
  // Day of year
  D: function(date, token, localize2) {
    const dayOfYear2 = getDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear2, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear2, token.length);
  },
  // Day of week
  E: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "EEEEE":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "EEEE":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(localDayOfWeek);
      // Padded numerical value
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "eeeee":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "eeee":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case "c":
        return String(localDayOfWeek);
      // Padded numerical value
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      // T
      case "ccccc":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      // Tuesday
      case "cccc":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case "i":
        return String(isoDayOfWeek);
      // 02
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
      // Tue
      case "iii":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "iiiii":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "iiiiii":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "iiii":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(date, token, localize2) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(date, token, localize2) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0) hours = 12;
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date, token);
  },
  // Hour [0-23]
  H: function(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date, token);
  },
  // Hour [0-11]
  K: function(date, token, localize2) {
    const hours = date.getHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function(date, token, localize2) {
    let hours = date.getHours();
    if (hours === 0) hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date, token);
  },
  // Second
  s: function(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date, token);
  },
  // Fraction of second
  S: function(date, token) {
    return lightFormatters.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function(date, token, _localize) {
    const timestamp = Math.trunc(+date / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function(date, token, _localize) {
    return addLeadingZeros(+date, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

// node_modules/date-fns/_lib/format/longFormatters.js
var dateLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "P":
      return formatLong2.date({ width: "short" });
    case "PP":
      return formatLong2.date({ width: "medium" });
    case "PPP":
      return formatLong2.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong2.date({ width: "full" });
  }
};
var timeLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "p":
      return formatLong2.time({ width: "short" });
    case "pp":
      return formatLong2.time({ width: "medium" });
    case "ppp":
      return formatLong2.time({ width: "long" });
    case "pppp":
    default:
      return formatLong2.time({ width: "full" });
  }
};
var dateTimeLongFormatter = (pattern, formatLong2) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.js
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format4, input) {
  const _message = message(token, format4, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format4, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format4}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// node_modules/date-fns/format.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date, options?.in);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map((substring) => {
    if (substring === "''") {
      return { isToken: false, value: "'" };
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return { isToken: false, value: cleanEscapedString(substring) };
    }
    if (formatters[firstCharacter]) {
      return { isToken: true, value: substring };
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
      );
    }
    return { isToken: false, value: substring };
  });
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  return parts.map((part) => {
    if (!part.isToken) return part.value;
    const token = part.value;
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, String(date));
    }
    const formatter = formatters[token[0]];
    return formatter(originalDate, token, locale.localize, formatterOptions);
  }).join("");
}
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// node_modules/date-fns/getDefaultOptions.js
function getDefaultOptions2() {
  return Object.assign({}, getDefaultOptions());
}

// node_modules/date-fns-tz/dist/esm/_lib/tzIntlTimeZoneName/index.js
function tzIntlTimeZoneName(length, date, options) {
  const defaultOptions2 = getDefaultOptions2();
  const dtf = getDTF(length, options.timeZone, options.locale ?? defaultOptions2.locale);
  return "formatToParts" in dtf ? partsTimeZone(dtf, date) : hackyTimeZone(dtf, date);
}
function partsTimeZone(dtf, date) {
  const formatted = dtf.formatToParts(date);
  for (let i = formatted.length - 1; i >= 0; --i) {
    if (formatted[i].type === "timeZoneName") {
      return formatted[i].value;
    }
  }
  return void 0;
}
function hackyTimeZone(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, "");
  const tzNameMatch = / [\w-+ ]+$/.exec(formatted);
  return tzNameMatch ? tzNameMatch[0].substr(1) : "";
}
function getDTF(length, timeZone, locale) {
  return new Intl.DateTimeFormat(locale ? [locale.code, "en-US"] : void 0, {
    timeZone,
    timeZoneName: length
  });
}

// node_modules/date-fns-tz/dist/esm/_lib/tzTokenizeDate/index.js
function tzTokenizeDate(date, timeZone) {
  const dtf = getDateTimeFormat(timeZone);
  return "formatToParts" in dtf ? partsOffset(dtf, date) : hackyOffset(dtf, date);
}
var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};
function partsOffset(dtf, date) {
  try {
    const formatted = dtf.formatToParts(date);
    const filled = [];
    for (let i = 0; i < formatted.length; i++) {
      const pos = typeToPos[formatted[i].type];
      if (pos !== void 0) {
        filled[pos] = parseInt(formatted[i].value, 10);
      }
    }
    return filled;
  } catch (error) {
    if (error instanceof RangeError) {
      return [NaN];
    }
    throw error;
  }
}
function hackyOffset(dtf, date) {
  const formatted = dtf.format(date);
  const parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted);
  return [
    parseInt(parsed[3], 10),
    parseInt(parsed[1], 10),
    parseInt(parsed[2], 10),
    parseInt(parsed[4], 10),
    parseInt(parsed[5], 10),
    parseInt(parsed[6], 10)
  ];
}
var dtfCache = {};
var testDateFormatted = new Intl.DateTimeFormat("en-US", {
  hourCycle: "h23",
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
}).format(/* @__PURE__ */ new Date("2014-06-25T04:00:00.123Z"));
var hourCycleSupported = testDateFormatted === "06/25/2014, 00:00:00" || testDateFormatted === "\u200E06\u200E/\u200E25\u200E/\u200E2014\u200E \u200E00\u200E:\u200E00\u200E:\u200E00";
function getDateTimeFormat(timeZone) {
  if (!dtfCache[timeZone]) {
    dtfCache[timeZone] = hourCycleSupported ? new Intl.DateTimeFormat("en-US", {
      hourCycle: "h23",
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }) : new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  return dtfCache[timeZone];
}

// node_modules/date-fns-tz/dist/esm/_lib/newDateUTC/index.js
function newDateUTC(fullYear, month, day, hour, minute, second, millisecond) {
  const utcDate = /* @__PURE__ */ new Date(0);
  utcDate.setUTCFullYear(fullYear, month, day);
  utcDate.setUTCHours(hour, minute, second, millisecond);
  return utcDate;
}

// node_modules/date-fns-tz/dist/esm/_lib/tzParseTimezone/index.js
var MILLISECONDS_IN_HOUR = 36e5;
var MILLISECONDS_IN_MINUTE = 6e4;
var patterns = {
  timezone: /([Z+-].*)$/,
  timezoneZ: /^(Z)$/,
  timezoneHH: /^([+-]\d{2})$/,
  timezoneHHMM: /^([+-])(\d{2}):?(\d{2})$/
};
function tzParseTimezone(timezoneString, date, isUtcDate) {
  if (!timezoneString) {
    return 0;
  }
  let token = patterns.timezoneZ.exec(timezoneString);
  if (token) {
    return 0;
  }
  let hours;
  let absoluteOffset;
  token = patterns.timezoneHH.exec(timezoneString);
  if (token) {
    hours = parseInt(token[1], 10);
    if (!validateTimezone(hours)) {
      return NaN;
    }
    return -(hours * MILLISECONDS_IN_HOUR);
  }
  token = patterns.timezoneHHMM.exec(timezoneString);
  if (token) {
    hours = parseInt(token[2], 10);
    const minutes = parseInt(token[3], 10);
    if (!validateTimezone(hours, minutes)) {
      return NaN;
    }
    absoluteOffset = Math.abs(hours) * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE;
    return token[1] === "+" ? -absoluteOffset : absoluteOffset;
  }
  if (isValidTimezoneIANAString(timezoneString)) {
    date = new Date(date || Date.now());
    const utcDate = isUtcDate ? date : toUtcDate(date);
    const offset = calcOffset(utcDate, timezoneString);
    const fixedOffset = isUtcDate ? offset : fixOffset(date, offset, timezoneString);
    return -fixedOffset;
  }
  return NaN;
}
function toUtcDate(date) {
  return newDateUTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}
function calcOffset(date, timezoneString) {
  const tokens = tzTokenizeDate(date, timezoneString);
  const asUTC = newDateUTC(tokens[0], tokens[1] - 1, tokens[2], tokens[3] % 24, tokens[4], tokens[5], 0).getTime();
  let asTS = date.getTime();
  const over = asTS % 1e3;
  asTS -= over >= 0 ? over : 1e3 + over;
  return asUTC - asTS;
}
function fixOffset(date, offset, timezoneString) {
  const localTS = date.getTime();
  let utcGuess = localTS - offset;
  const o2 = calcOffset(new Date(utcGuess), timezoneString);
  if (offset === o2) {
    return offset;
  }
  utcGuess -= o2 - offset;
  const o3 = calcOffset(new Date(utcGuess), timezoneString);
  if (o2 === o3) {
    return o2;
  }
  return Math.max(o2, o3);
}
function validateTimezone(hours, minutes) {
  return -23 <= hours && hours <= 23 && (minutes == null || 0 <= minutes && minutes <= 59);
}
var validIANATimezoneCache = {};
function isValidTimezoneIANAString(timeZoneString) {
  if (validIANATimezoneCache[timeZoneString])
    return true;
  try {
    new Intl.DateTimeFormat(void 0, { timeZone: timeZoneString });
    validIANATimezoneCache[timeZoneString] = true;
    return true;
  } catch (error) {
    return false;
  }
}

// node_modules/date-fns-tz/dist/esm/format/formatters/index.js
var MILLISECONDS_IN_MINUTE2 = 60 * 1e3;
var formatters2 = {
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date, token, options) {
    const timezoneOffset = getTimeZoneOffset(options.timeZone, date);
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes2(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return formatTimezone2(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimeter
      default:
        return formatTimezone2(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date, token, options) {
    const timezoneOffset = getTimeZoneOffset(options.timeZone, date);
    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes2(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return formatTimezone2(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimeter
      default:
        return formatTimezone2(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date, token, options) {
    const timezoneOffset = getTimeZoneOffset(options.timeZone, date);
    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort2(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone2(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date, token, options) {
    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return tzIntlTimeZoneName("short", date, options);
      // Long
      case "zzzz":
      default:
        return tzIntlTimeZoneName("long", date, options);
    }
  }
};
function getTimeZoneOffset(timeZone, originalDate) {
  const timeZoneOffset = timeZone ? tzParseTimezone(timeZone, originalDate, true) / MILLISECONDS_IN_MINUTE2 : originalDate?.getTimezoneOffset() ?? 0;
  if (Number.isNaN(timeZoneOffset)) {
    throw new RangeError("Invalid time zone specified: " + timeZone);
  }
  return timeZoneOffset;
}
function addLeadingZeros2(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  let output = Math.abs(number).toString();
  while (output.length < targetLength) {
    output = "0" + output;
  }
  return sign + output;
}
function formatTimezone2(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros2(Math.floor(absOffset / 60), 2);
  const minutes = addLeadingZeros2(Math.floor(absOffset % 60), 2);
  return sign + hours + delimiter + minutes;
}
function formatTimezoneWithOptionalMinutes2(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros2(Math.abs(offset) / 60, 2);
  }
  return formatTimezone2(offset, delimiter);
}
function formatTimezoneShort2(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros2(minutes, 2);
}

// node_modules/date-fns-tz/dist/esm/_lib/getTimezoneOffsetInMilliseconds/index.js
function getTimezoneOffsetInMilliseconds2(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return +date - +utcDate;
}

// node_modules/date-fns-tz/dist/esm/_lib/tzPattern/index.js
var tzPattern = /(Z|[+-]\d{2}(?::?\d{2})?| UTC| [a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?)$/;

// node_modules/date-fns-tz/dist/esm/toDate/index.js
var MILLISECONDS_IN_HOUR2 = 36e5;
var MILLISECONDS_IN_MINUTE3 = 6e4;
var DEFAULT_ADDITIONAL_DIGITS = 2;
var patterns2 = {
  dateTimePattern: /^([0-9W+-]+)(T| )(.*)/,
  datePattern: /^([0-9W+-]+)(.*)/,
  plainTime: /:/,
  // year tokens
  YY: /^(\d{2})$/,
  YYY: [
    /^([+-]\d{2})$/,
    // 0 additional digits
    /^([+-]\d{3})$/,
    // 1 additional digit
    /^([+-]\d{4})$/
    // 2 additional digits
  ],
  YYYY: /^(\d{4})/,
  YYYYY: [
    /^([+-]\d{4})/,
    // 0 additional digits
    /^([+-]\d{5})/,
    // 1 additional digit
    /^([+-]\d{6})/
    // 2 additional digits
  ],
  // date tokens
  MM: /^-(\d{2})$/,
  DDD: /^-?(\d{3})$/,
  MMDD: /^-?(\d{2})-?(\d{2})$/,
  Www: /^-?W(\d{2})$/,
  WwwD: /^-?W(\d{2})-?(\d{1})$/,
  HH: /^(\d{2}([.,]\d*)?)$/,
  HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
  HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
  // time zone tokens (to identify the presence of a tz)
  timeZone: tzPattern
};
function toDate2(argument, options = {}) {
  if (arguments.length < 1) {
    throw new TypeError("1 argument required, but only " + arguments.length + " present");
  }
  if (argument === null) {
    return /* @__PURE__ */ new Date(NaN);
  }
  const additionalDigits = options.additionalDigits == null ? DEFAULT_ADDITIONAL_DIGITS : Number(options.additionalDigits);
  if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
    throw new RangeError("additionalDigits must be 0, 1 or 2");
  }
  if (argument instanceof Date || typeof argument === "object" && Object.prototype.toString.call(argument) === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || Object.prototype.toString.call(argument) === "[object Number]") {
    return new Date(argument);
  } else if (!(Object.prototype.toString.call(argument) === "[object String]")) {
    return /* @__PURE__ */ new Date(NaN);
  }
  const dateStrings = splitDateString(argument);
  const { year, restDateString } = parseYear(dateStrings.date, additionalDigits);
  const date = parseDate(restDateString, year);
  if (date === null || isNaN(date.getTime())) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (date) {
    const timestamp = date.getTime();
    let time = 0;
    let offset;
    if (dateStrings.time) {
      time = parseTime(dateStrings.time);
      if (time === null || isNaN(time)) {
        return /* @__PURE__ */ new Date(NaN);
      }
    }
    if (dateStrings.timeZone || options.timeZone) {
      offset = tzParseTimezone(dateStrings.timeZone || options.timeZone, new Date(timestamp + time));
      if (isNaN(offset)) {
        return /* @__PURE__ */ new Date(NaN);
      }
    } else {
      offset = getTimezoneOffsetInMilliseconds2(new Date(timestamp + time));
      offset = getTimezoneOffsetInMilliseconds2(new Date(timestamp + time + offset));
    }
    return new Date(timestamp + time + offset);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}
function splitDateString(dateString) {
  const dateStrings = {};
  let parts = patterns2.dateTimePattern.exec(dateString);
  let timeString;
  if (!parts) {
    parts = patterns2.datePattern.exec(dateString);
    if (parts) {
      dateStrings.date = parts[1];
      timeString = parts[2];
    } else {
      dateStrings.date = null;
      timeString = dateString;
    }
  } else {
    dateStrings.date = parts[1];
    timeString = parts[3];
  }
  if (timeString) {
    const token = patterns2.timeZone.exec(timeString);
    if (token) {
      dateStrings.time = timeString.replace(token[1], "");
      dateStrings.timeZone = token[1].trim();
    } else {
      dateStrings.time = timeString;
    }
  }
  return dateStrings;
}
function parseYear(dateString, additionalDigits) {
  if (dateString) {
    const patternYYY = patterns2.YYY[additionalDigits];
    const patternYYYYY = patterns2.YYYYY[additionalDigits];
    let token = patterns2.YYYY.exec(dateString) || patternYYYYY.exec(dateString);
    if (token) {
      const yearString = token[1];
      return {
        year: parseInt(yearString, 10),
        restDateString: dateString.slice(yearString.length)
      };
    }
    token = patterns2.YY.exec(dateString) || patternYYY.exec(dateString);
    if (token) {
      const centuryString = token[1];
      return {
        year: parseInt(centuryString, 10) * 100,
        restDateString: dateString.slice(centuryString.length)
      };
    }
  }
  return {
    year: null
  };
}
function parseDate(dateString, year) {
  if (year === null) {
    return null;
  }
  let date;
  let month;
  let week;
  if (!dateString || !dateString.length) {
    date = /* @__PURE__ */ new Date(0);
    date.setUTCFullYear(year);
    return date;
  }
  let token = patterns2.MM.exec(dateString);
  if (token) {
    date = /* @__PURE__ */ new Date(0);
    month = parseInt(token[1], 10) - 1;
    if (!validateDate(year, month)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, month);
    return date;
  }
  token = patterns2.DDD.exec(dateString);
  if (token) {
    date = /* @__PURE__ */ new Date(0);
    const dayOfYear2 = parseInt(token[1], 10);
    if (!validateDayOfYearDate(year, dayOfYear2)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, 0, dayOfYear2);
    return date;
  }
  token = patterns2.MMDD.exec(dateString);
  if (token) {
    date = /* @__PURE__ */ new Date(0);
    month = parseInt(token[1], 10) - 1;
    const day = parseInt(token[2], 10);
    if (!validateDate(year, month, day)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, month, day);
    return date;
  }
  token = patterns2.Www.exec(dateString);
  if (token) {
    week = parseInt(token[1], 10) - 1;
    if (!validateWeekDate(week)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    return dayOfISOWeekYear(year, week);
  }
  token = patterns2.WwwD.exec(dateString);
  if (token) {
    week = parseInt(token[1], 10) - 1;
    const dayOfWeek = parseInt(token[2], 10) - 1;
    if (!validateWeekDate(week, dayOfWeek)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  }
  return null;
}
function parseTime(timeString) {
  let hours;
  let minutes;
  let token = patterns2.HH.exec(timeString);
  if (token) {
    hours = parseFloat(token[1].replace(",", "."));
    if (!validateTime(hours)) {
      return NaN;
    }
    return hours % 24 * MILLISECONDS_IN_HOUR2;
  }
  token = patterns2.HHMM.exec(timeString);
  if (token) {
    hours = parseInt(token[1], 10);
    minutes = parseFloat(token[2].replace(",", "."));
    if (!validateTime(hours, minutes)) {
      return NaN;
    }
    return hours % 24 * MILLISECONDS_IN_HOUR2 + minutes * MILLISECONDS_IN_MINUTE3;
  }
  token = patterns2.HHMMSS.exec(timeString);
  if (token) {
    hours = parseInt(token[1], 10);
    minutes = parseInt(token[2], 10);
    const seconds = parseFloat(token[3].replace(",", "."));
    if (!validateTime(hours, minutes, seconds)) {
      return NaN;
    }
    return hours % 24 * MILLISECONDS_IN_HOUR2 + minutes * MILLISECONDS_IN_MINUTE3 + seconds * 1e3;
  }
  return null;
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
  week = week || 0;
  day = day || 0;
  const date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  const fourthOfJanuaryDay = date.getUTCDay() || 7;
  const diff = week * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
function validateDate(year, month, date) {
  if (month < 0 || month > 11) {
    return false;
  }
  if (date != null) {
    if (date < 1) {
      return false;
    }
    const isLeapYear2 = isLeapYearIndex(year);
    if (isLeapYear2 && date > DAYS_IN_MONTH_LEAP_YEAR[month]) {
      return false;
    }
    if (!isLeapYear2 && date > DAYS_IN_MONTH[month]) {
      return false;
    }
  }
  return true;
}
function validateDayOfYearDate(year, dayOfYear2) {
  if (dayOfYear2 < 1) {
    return false;
  }
  const isLeapYear2 = isLeapYearIndex(year);
  if (isLeapYear2 && dayOfYear2 > 366) {
    return false;
  }
  if (!isLeapYear2 && dayOfYear2 > 365) {
    return false;
  }
  return true;
}
function validateWeekDate(week, day) {
  if (week < 0 || week > 52) {
    return false;
  }
  if (day != null && (day < 0 || day > 6)) {
    return false;
  }
  return true;
}
function validateTime(hours, minutes, seconds) {
  if (hours < 0 || hours >= 25) {
    return false;
  }
  if (minutes != null && (minutes < 0 || minutes >= 60)) {
    return false;
  }
  if (seconds != null && (seconds < 0 || seconds >= 60)) {
    return false;
  }
  return true;
}

// node_modules/date-fns-tz/dist/esm/format/index.js
var tzFormattingTokensRegExp = /([xXOz]+)|''|'(''|[^'])+('|$)/g;
function format2(date, formatStr, options = {}) {
  formatStr = String(formatStr);
  const matches = formatStr.match(tzFormattingTokensRegExp);
  if (matches) {
    const d = toDate2(options.originalDate || date, options);
    formatStr = matches.reduce(function(result, token) {
      if (token[0] === "'") {
        return result;
      }
      const pos = result.indexOf(token);
      const precededByQuotedSection = result[pos - 1] === "'";
      const replaced = result.replace(token, "'" + formatters2[token[0]](d, token, options) + "'");
      return precededByQuotedSection ? replaced.substring(0, pos - 1) + replaced.substring(pos + 1) : replaced;
    }, formatStr);
  }
  return format(date, formatStr, options);
}

// node_modules/date-fns-tz/dist/esm/toZonedTime/index.js
function toZonedTime(date, timeZone, options) {
  date = toDate2(date, options);
  const offsetMilliseconds = tzParseTimezone(timeZone, date, true);
  const d = new Date(date.getTime() - offsetMilliseconds);
  const resultDate = /* @__PURE__ */ new Date(0);
  resultDate.setFullYear(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  resultDate.setHours(d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
  return resultDate;
}

// node_modules/date-fns-tz/dist/esm/formatInTimeZone/index.js
function formatInTimeZone(date, timeZone, formatStr, options) {
  options = {
    ...options,
    timeZone,
    originalDate: date
  };
  return format2(toZonedTime(date, timeZone, { timeZone: options.timeZone }), formatStr, options);
}

// server/scheduler.ts
var import_app2 = require("firebase-admin/app");
function getCalculationMethod(methodId) {
  switch (methodId) {
    case 1:
      return CalculationMethod_default.Karachi();
    case 2:
      return CalculationMethod_default.NorthAmerica();
    case 3:
      return CalculationMethod_default.MuslimWorldLeague();
    case 4:
      return CalculationMethod_default.UmmAlQura();
    case 5:
      return CalculationMethod_default.Egyptian();
    default:
      return CalculationMethod_default.UmmAlQura();
  }
}
function startScheduler() {
  import_node_cron.default.schedule("* * * * *", async () => {
    if ((0, import_app2.getApps)().length === 0) return;
    try {
      console.log("Running prayer times scheduler...");
      const db = (0, import_firestore2.getFirestore)(firebase_applet_config_default.firestoreDatabaseId);
      const usersSnapshot = await db.collection("users").get();
      const now = /* @__PURE__ */ new Date();
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        if (!userData.prayerSettings) continue;
        const settings = userData.prayerSettings;
        if (!settings.alarmsEnabled || !settings.pushNotificationsEnabled) continue;
        if (!settings.location || !settings.location.lat) continue;
        const timezone = settings.timezone || "UTC";
        try {
          const coordinates = new Coordinates(settings.location.lat, settings.location.lng);
          const params = getCalculationMethod(settings.method);
          params.madhab = settings.school === 1 ? Madhab.Hanafi : Madhab.Shafi;
          const localDate = toZonedTime(now, timezone);
          const prayerTimes = new PrayerTimes(coordinates, localDate, params);
          const userDayOfWeek = parseInt(formatInTimeZone(now, timezone, "i"));
          const currentMinute = formatInTimeZone(now, timezone, "HH:mm");
          const prayers = [
            { name: "Fajr", time: prayerTimes.fajr },
            { name: "Asr", time: prayerTimes.asr },
            { name: "Maghrib", time: prayerTimes.maghrib },
            { name: "Isha", time: prayerTimes.isha }
          ];
          if (userDayOfWeek === 5) {
            const defaultKhutbahTimeString = formatInTimeZone(prayerTimes.dhuhr, timezone, "HH:mm");
            const defaultJumaTime = addMinutes(prayerTimes.dhuhr, 30);
            const defaultJumaTimeString = formatInTimeZone(defaultJumaTime, timezone, "HH:mm");
            const khutbahTimeStr = settings.customTimings?.["JummaKhutbah"] || defaultKhutbahTimeString;
            const jumaTimeStr = settings.customTimings?.["Jumma"] || defaultJumaTimeString;
            prayers.push({ name: "JummaKhutbah", localTimeString: khutbahTimeStr, isKhutbah: true });
            prayers.push({ name: "Jumma", localTimeString: jumaTimeStr, isJuma: true });
          } else {
            prayers.push({ name: "Dhuhr", time: prayerTimes.dhuhr });
          }
          if (userDayOfWeek === 4) {
            const defaultJumaTime = addMinutes(prayerTimes.dhuhr, 30);
            const defaultJumaTimeString = formatInTimeZone(defaultJumaTime, timezone, "HH:mm");
            const jumaTimeStr = settings.customTimings?.["Jumma"] || defaultJumaTimeString;
            prayers.push({ name: "Jumma", localTimeString: jumaTimeStr, isJuma: true, isThursdayReminder: true });
          }
          const subtractMinsStr = (timeStr, mins) => {
            const [h, m] = timeStr.split(":").map(Number);
            const totalMins = h * 60 + m - mins;
            const newH = Math.floor((totalMins + 24 * 60) / 60) % 24;
            const newM = (totalMins + 24 * 60) % 60;
            return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
          };
          for (const prayer of prayers) {
            if (!prayer.time && !prayer.localTimeString) continue;
            let prayerMinute = "";
            let formattedTime = "";
            if (prayer.localTimeString) {
              prayerMinute = prayer.localTimeString;
              const [h, m] = prayerMinute.split(":").map(Number);
              const suffix = h >= 12 ? "PM" : "AM";
              const displayH = h % 12 || 12;
              formattedTime = `${displayH}:${m.toString().padStart(2, "0")} ${suffix}`;
            } else if (prayer.time) {
              prayerMinute = formatInTimeZone(prayer.time, timezone, "HH:mm");
              formattedTime = formatInTimeZone(prayer.time, timezone, "h:mm a");
            }
            let preAlarmMins = settings.preAlarmMinutes || 0;
            if (prayer.isKhutbah) preAlarmMins = 60;
            else if (prayer.isJuma && !prayer.isThursdayReminder) preAlarmMins = 15;
            else if (prayer.isThursdayReminder) preAlarmMins = 0;
            let preAlarmMinute = null;
            if (preAlarmMins > 0) {
              preAlarmMinute = subtractMinsStr(prayerMinute, preAlarmMins);
            }
            let isPrayerTime = currentMinute === prayerMinute;
            let isPreAlarmTime = preAlarmMinute !== null && currentMinute === preAlarmMinute;
            const soundPref = settings.prayerAlarmSounds?.[prayer.name] || settings.alarmSound || "default";
            if (soundPref === "off") continue;
            if (isPrayerTime || isPreAlarmTime) {
              let message2 = "";
              let title = "";
              if (prayer.isThursdayReminder) {
                title = "Tomorrow is Juma!";
                message2 = `Juma prayer will be at ${formattedTime} tomorrow in ${settings.location.name}.`;
              } else if (prayer.isKhutbah) {
                if (isPrayerTime) {
                  title = "Time for Juma Khutbah";
                  message2 = `Juma Khutbah starts now at ${formattedTime} in ${settings.location.name}.`;
                } else {
                  title = "Upcoming: Juma Khutbah";
                  message2 = `Juma Khutbah will start in 1 hour at ${formattedTime}.`;
                }
              } else if (prayer.isJuma) {
                if (isPrayerTime) {
                  title = "Time for Juma Prayer";
                  message2 = `Juma Prayer starts now at ${formattedTime} in ${settings.location.name}.`;
                } else {
                  title = "Upcoming: Juma Prayer";
                  message2 = `Juma Prayer will start in 15 minutes at ${formattedTime}.`;
                }
              } else {
                title = isPrayerTime ? `Time for ${prayer.name}` : `Upcoming: ${prayer.name}`;
                message2 = isPrayerTime ? `${prayer.name} Prayer Time - ${formattedTime} in ${settings.location.name}. It is time for prayer.` : `${prayer.name} Prayer will start in ${preAlarmMins} minutes at ${formattedTime}.`;
              }
              await sendPrayerNotificationToUser(doc.id, title, message2, soundPref);
            }
          }
        } catch (err) {
          console.error(`Error processing prayers for user ${doc.id}:`, err);
        }
      }
    } catch (err) {
      console.error("Error in cron job:", err);
    }
  });
  console.log("Prayer times background scheduler started.");
}
async function sendPrayerNotificationToUser(userId, title, body, sound) {
  const db = (0, import_firestore2.getFirestore)(firebase_applet_config_default.firestoreDatabaseId);
  const tokensSnapshot = await db.collection("users").doc(userId).collection("fcmTokens").get();
  if (tokensSnapshot.empty) return;
  const tokens = tokensSnapshot.docs.map((doc) => doc.data().token).filter(Boolean);
  if (tokens.length === 0) return;
  const uniqueTokens = [...new Set(tokens)];
  const payload = {
    notification: {
      title,
      body
    },
    data: {
      type: "prayer_alarm",
      sound
    },
    android: {
      priority: "high",
      notification: {
        sound: sound === "default" ? "default" : sound,
        channelId: "prayer_alarms_channel",
        visibility: "public",
        defaultSound: sound === "default",
        defaultVibrateTimings: true,
        defaultLightSettings: true
      }
    },
    apns: {
      headers: {
        "apns-priority": "10"
      },
      payload: {
        aps: {
          sound: sound === "default" ? "default" : `${sound}.caf`
        }
      }
    },
    webpush: {
      headers: {
        Urgency: "high"
      },
      notification: {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        requireInteraction: true
      }
    },
    tokens: uniqueTokens
  };
  const response = await (0, import_messaging2.getMessaging)().sendEachForMulticast(payload);
  if (response.failureCount > 0) {
    const tokensToDelete = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (errorCode === "messaging/registration-token-not-registered" || errorCode === "messaging/invalid-registration-token") {
          tokensToDelete.push(uniqueTokens[idx]);
        }
      }
    });
    if (tokensToDelete.length > 0) {
      const batch = db.batch();
      tokensSnapshot.docs.forEach((doc) => {
        if (tokensToDelete.includes(doc.data().token)) {
          batch.delete(doc.ref);
        }
      });
      await batch.commit();
    }
  }
}

// server.ts
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  app.use(import_express2.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.use(notifications_default);
  const isProd = process.env.NODE_ENV === "production" || !!process.env.K_SERVICE || process.argv[1] && process.argv[1].endsWith(".cjs");
  if (isProd) {
    process.env.NODE_ENV = "production";
  }
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  startScheduler();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer().catch(console.error);
//# sourceMappingURL=server.cjs.map
