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
} from "lucide-react";
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
  const { user } = useAuth();
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
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setPhotoURL(data.photoURL || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");
            setLocation(data.location || "");
            setState(data.state || "");
            setPinCode(data.pinCode || "");
            setCountry(data.country || "");
            setLocalProfile({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              photoURL: data.photoURL || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              location: data.location || "",
              state: data.state || "",
              pinCode: data.pinCode || "",
              country: data.country || "",
            });
          }
        } catch (error) {
          console.error("Error loading profile from Firebase:", error);
        }
      }
    }
    loadUserProfile();
  }, [user]);

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
            <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-black/30 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors pr-10 ${
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
