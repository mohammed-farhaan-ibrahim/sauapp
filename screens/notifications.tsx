import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, onSnapshot, orderBy, DocumentData } from "firebase/firestore";

interface Notification {
  id: string;
  category: string;
  message: string;
  timestamp: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications: Notification[] = snapshot.docs.map((doc: DocumentData) => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category || "General",
          message: data.message || "No message available.",
          timestamp: data.timestamp ? data.timestamp.toDate().toLocaleString() : "No Date",
        };
      });
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <ScrollView style={styles.notificationList}>
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.notificationCard}>
              <View style={styles.notificationText}>
                <Text style={styles.category}>{notif.category.toUpperCase()}</Text>
                <Text>{notif.message}</Text>
                <Text style={styles.timestamp}>{notif.timestamp}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noNotifications}>No notifications available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  notificationList: { marginTop: 10 },
  notificationCard: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  notificationText: { flex: 1 },
  category: { fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#777", marginTop: 5 },
  noNotifications: { textAlign: "center", marginTop: 20, color: "#777" },
});

export default Notifications;
