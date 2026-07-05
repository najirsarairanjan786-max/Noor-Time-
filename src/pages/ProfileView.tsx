import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  UserCircle,
  Camera,
  Plus,
  Image as ImageIcon,
  MapPin,
  CheckCircle2,
  XCircle,
  LogOut,
} from "@/src/lib/icons";
import { useLocalStorage } from "usehooks-ts";
import { useSettings } from "../hooks/useSettings";
import { useTranslation } from "../lib/i18n";
import { LocationPickerModal } from "../components/LocationPickerModal";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export function ProfileView({ setView }: { setView: (view: string) => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const { user, signIn, logOut } = useAuth();
  const [localProfile, setLocalProfile] = useLocalStorage(
    "islamic-app-local-profile",
    {
      firstName: "",
      lastName: "",
      photoURL: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      state: "",
      pinCode: "",
      country: "",
    },
  );

  const [firstName, setFirstName] = useState(localProfile.firstName);
  const [lastName, setLastName] = useState(localProfile.lastName);
  const [photoURL, setPhotoURL] = useState(localProfile.photoURL);
  const [email, setEmail] = useState(localProfile.email || "");
  const [phone, setPhone] = useState(localProfile.phone || "");
  const [address, setAddress] = useState(localProfile.address || "");
  const [location, setLocation] = useState(localProfile.location || "");
  const [state, setState] = useState(localProfile.state || "");
  const [pinCode, setPinCode] = useState(localProfile.pinCode || "");
  const [country, setCountry] = useState(localProfile.country || "");
  const [success, setSuccess] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFirstName(data.firstName || user.displayName?.split(' ')[0] || "");
            setLastName(data.lastName || user.displayName?.split(' ').slice(1).join(' ') || "");
            setPhotoURL(data.photoURL || user.photoURL || "");
            setEmail(data.email || user.email || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");
            setLocation(data.location || "");
            setState(data.state || "");
            setPinCode(data.pinCode || "");
            setCountry(data.country || "");
            setLocalProfile({
              firstName: data.firstName || user.displayName?.split(' ')[0] || "",
              lastName: data.lastName || user.displayName?.split(' ').slice(1).join(' ') || "",
              photoURL: data.photoURL || user.photoURL || "",
              email: data.email || user.email || "",
              phone: data.phone || "",
              address: data.address || "",
              location: data.location || "",
              state: data.state || "",
              pinCode: data.pinCode || "",
              country: data.country || "",
            });
          } else {
            // Auto-populate from Google if no doc exists yet
            setFirstName(user.displayName?.split(' ')[0] || "");
            setLastName(user.displayName?.split(' ').slice(1).join(' ') || "");
            setPhotoURL(user.photoURL || "");
            setEmail(user.email || "");
          }
        } catch (error) {
          console.error("Error loading profile from Firebase:", error);
        }
      }
    }
    loadUserProfile();
  }, [user, setLocalProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      firstName,
      lastName,
      photoURL,
      email,
      phone,
      address,
      location,
      state,
      pinCode,
      country,
    };
    setLocalProfile(profileData);

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          ...profileData,
          updatedAt: serverTimestamp(),
          userId: user.uid
        });
        setSuccess("Profile saved effectively to Firebase!");
      } catch (error) {
        console.error("Error saving profile to Firebase:", error);
        setSuccess("Profile saved locally (Firebase error).");
      }
    } else {
      setSuccess("Profile saved locally! Sign in to sync.");
    }
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleResetProfile = () => {
    setFirstName("");
    setLastName("");
    setPhotoURL("");
    setEmail("");
    setPhone("");
    setAddress("");
    setLocation("");
    setState("");
    setPinCode("");
    setCountry("");
    setLocalProfile({
      firstName: "",
      lastName: "",
      photoURL: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      state: "",
      pinCode: "",
      country: "",
    });
    setSuccess("Profile reset successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (pinCode.length >= 4) {
      const delayTimer = setTimeout(async () => {
        try {
          // Attempt India Postal API first if it's 6 digits, otherwise fallback to generic nominatim
          if (pinCode.length === 6 && /^\d+$/.test(pinCode)) {
            const inRes = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
            const inData = await inRes.json();
            if (inData && inData[0] && inData[0].Status === "Success") {
              const postOffice = inData[0].PostOffice[0];
              setLocation(postOffice.District || postOffice.Block || postOffice.Name);
              setState(postOffice.State);
              setCountry("India");
              return;
            }
          }

          const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&format=json&addressdetails=1&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            const address = data[0].address;
            if (address) {
              const fetchedCity = address.city || address.town || address.village || address.state_district || "";
              const fetchedState = address.state || "";
              const fetchedCountry = address.country || "";
              
              if (fetchedCity) setLocation(fetchedCity);
              if (fetchedState) setState(fetchedState);
              if (fetchedCountry) setCountry(fetchedCountry);
            }
          }
        } catch (error) {
          console.error("Error fetching location from pin code:", error);
        }
      }, 800);
      return () => clearTimeout(delayTimer);
    }
  }, [pinCode]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-[#050B14] pb-24 overflow-y-auto"
    >
      <div className="bg-emerald-900/40 p-4 pt-12 rounded-b-3xl shadow-lg relative px-6">
        <button
          onClick={() => setView("home")}
          className="absolute top-12 left-4 p-2 rounded-full hover:bg-white/10 transition-colors text-emerald-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-emerald-200/70 text-sm">
            Personalize your experience
          </p>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-8 relative">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-900/50 flex items-center justify-center text-4xl overflow-hidden border-2 border-emerald-500 shadow-xl relative group">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-12 h-12 text-emerald-400" />
              )}
              <label className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex transition-all cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowPhotoMenu(!showPhotoMenu)}
              className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-[#050B14] rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-emerald-400 transition-colors shadow-lg z-10"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>

            {showPhotoMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowPhotoMenu(false)}
                />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-40 bg-emerald-950 border border-emerald-800/80 rounded-xl shadow-2xl overflow-hidden z-30 font-medium">
                  <label className="flex items-center gap-3 w-full px-4 py-3 text-sm text-emerald-100 hover:bg-emerald-900/50 cursor-pointer transition-colors border-b border-emerald-800/30">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    Gallery
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleImageUpload(e);
                        setShowPhotoMenu(false);
                      }}
                    />
                  </label>
                  <label className="flex items-center gap-3 w-full px-4 py-3 text-sm text-emerald-100 hover:bg-emerald-900/50 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        handleImageUpload(e);
                        setShowPhotoMenu(false);
                      }}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
          {firstName && (
            <h2 className="text-xl font-bold text-white mt-4">
              {[firstName, lastName].filter(Boolean).join(" ")}
            </h2>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ml-1 mr-1">
              <label className="block text-emerald-200/70 text-xs font-semibold">
                Email {user && <span className="text-emerald-400 font-normal">(Connected to Google)</span>}
              </label>
              {user ? (
                <button
                  type="button"
                  onClick={logOut}
                  className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              ) : null}
            </div>
            
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!user}
                className={`w-full ${user ? 'bg-black/50 opacity-80 cursor-not-allowed' : 'bg-black/30'} border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors pr-10 ${
                  email.length > 0
                    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      ? "border-emerald-500/50 focus:border-emerald-400"
                      : "border-red-500/50 focus:border-red-400"
                    : "border-emerald-800/50 focus:border-emerald-500"
                }`}
                placeholder="your.email@example.com"
              />
              {email.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
              <p className="text-red-400 text-xs mt-1 ml-1">{t("invalidEmail")}</p>
            )}
            
            {!user && (
              <button
                type="button"
                onClick={signIn}
                className="mt-3 w-full py-2.5 bg-white text-slate-800 hover:bg-slate-100 font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect with Google
              </button>
            )}
          </div>

          <div>
            <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
              placeholder="+91 1234567890"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-emerald-200/70 text-xs font-semibold mb-2 ml-1">
              City / Location
            </label>
            <div className="flex flex-col gap-2 relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="City, District"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      try {
                        const res = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=en`,
                        );
                        const data = await res.json();
                        const city =
                          data.address?.city ||
                          data.address?.town ||
                          data.address?.village ||
                          "";
                        const _state = data.address?.state || "";
                        const country = data.address?.country || "";

                        // Smart format for city/location field
                        let formattedLocation = city;
                        if (!city && _state) formattedLocation = _state;
                        else if (!city && !state && country)
                          formattedLocation = country;

                        setLocation(formattedLocation);
                        if (country) setCountry(country);
                        if (_state) setState(_state);
                        if (data.address?.postcode)
                          setPinCode(data.address?.postcode);
                      } catch (e) {
                        alert("Could not fetch location name");
                      }
                    },
                    (error) =>
                      alert("Error getting location: " + error.message),
                  );
                } else {
                  alert("Geolocation is not supported by your browser");
                }
              }}
              className="mt-2 text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors ml-1"
            >
              Use My Current Location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="State or Province"
              />
            </div>

            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
                Pin Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="123456"
              />
            </div>
          </div>

          {success && (
            <div className="text-emerald-400 text-xs text-center font-medium mt-2">
              {success}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleResetProfile}
              className="flex-1 py-4 bg-black/40 hover:bg-black/60 border border-emerald-900/50 hover:border-emerald-500/50 text-emerald-400 font-medium rounded-2xl transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={(loc) => {
          setIsLocationModalOpen(false);
          
          if (loc.address) {
            const addr = loc.address;
            const city = addr.city || addr.town || addr.village || "";
            const st = addr.state || "";
            const ctry = addr.country || "";
            let formattedLocation = city;
            if (!city && st) formattedLocation = st;
            else if (!city && !st && ctry) formattedLocation = ctry;

            setLocation(formattedLocation);
            if (ctry) setCountry(ctry);
            if (st) setState(st);
            if (addr.postcode) setPinCode(addr.postcode);
          } else {
            setLocation(loc.name);
          }
        }}
      />
    </motion.div>
  );
}
