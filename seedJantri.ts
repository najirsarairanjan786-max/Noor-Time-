import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import { jantriBookData } from "./src/data/jantriBookData";

const firebaseConfig = {
  // Need to read from .env or just use the admin sdk.
};
// Actually I can just write a script that runs inside the app context using Vite or ts-node?
