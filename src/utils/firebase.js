import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

let firebaseApp = null;

export default function firebaseInit() {
  if (firebaseApp === null) {
    const firebaseConfig = {
      apiKey: 'AIzaSyA4JRB2Bn_kJOcIdbLUQcVBkZZjVC4pMlo',
      authDomain: 'christmas-geography.firebaseapp.com',
      databaseURL: 'https://christmas-geography.firebaseio.com',
      projectId: 'christmas-geography',
      storageBucket: 'christmas-geography.appspot.com',
      messagingSenderId: '1093394628526',
      appId: '1:1093394628526:web:a5f31556022febacb7d23f',
    };

    firebaseApp = firebase.initializeApp(firebaseConfig);
    window.firebaseApp = firebaseApp;
  }
  return firebaseApp;
}
