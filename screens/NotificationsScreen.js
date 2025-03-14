import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getFirestore, collection, onSnapshot, query, where } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import moment from "moment";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ffcccc";
      case "medium":
        return "#ffffcc";
      case "low":
        return "#ccffcc";
      default:
        return "#f8f8f8";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.timestamp}>{moment(item.timestamp.toDate()).fromNow()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold" },
  card: { padding: 15, marginVertical: 8, borderRadius: 8, elevation: 3 },
  title: { fontSize: 18, fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#999", marginTop: 5 },
});

export default NotificationsScreen;