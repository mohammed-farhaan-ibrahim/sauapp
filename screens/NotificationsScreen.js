import React, { useEffect, useState } from "react"; // Import React and Hooks
import { View, Text, FlatList, StyleSheet } from "react-native"; // Import UI components
import { db } from "../firebaseConfig"; // Import Firestore instance from config
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"; // Firestore functions

/**
 * NotificationsScreen Component
 * 
 * This screen fetches and displays notifications from Firestore in real-time.
 * Whenever a new notification is added via the web form, it instantly updates on this screen.
 */
const NotificationsScreen = () => {
  // State to store fetched notifications
  const [notifications, setNotifications] = useState([]);

  /**
   * useEffect Hook - Runs when the component mounts
   * 
   * - Listens for changes in Firestore using `onSnapshot()`
   * - Orders notifications by timestamp (latest first)
   * - Updates state when Firestore data changes
   */
  useEffect(() => {
    // Reference to Firestore collection
    const notificationsRef = collection(db, "notifications");

    // Query: Order notifications by timestamp in descending order (latest first)
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    // Real-time listener: Fires whenever data in Firestore changes
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Firestore document ID
        ...doc.data(), // Extract other fields from document
      }));

      // Update state with the new notifications
      setNotifications(notificationList);
    });

    // Cleanup function to stop listening when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      {/* FlatList to render notifications dynamically */}
      <FlatList
        data={notifications} // Data source
        keyExtractor={(item) => item.id} // Unique key for each item
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.title}>{item.category}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.target}>Target: {item.target}</Text>
          </View>
        )}
      />
    </View>
  );
};

/**
 * Styles for the Notifications Screen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notificationCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    fontSize: 16,
    marginTop: 5,
  },
  target: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
});

export default NotificationsScreen; // Export the component for use in App.js
