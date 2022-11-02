const admin = require('firebase-admin');
var serviceAccount = require("./config/credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jwaladeepam-8c66f-default-rtdb.firebaseio.com/"
})

      const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      };
      
const notify = async (registrationToken, message) => {
    const options = notification_options;
    const note = await admin.messaging().sendToDevice(registrationToken, message, options)
    return note
};


module.exports = {
    notify
}