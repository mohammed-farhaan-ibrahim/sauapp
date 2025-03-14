import React, { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from "react-native";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { auth } from "../firebaseConfig";

const AdminDashboard = ({ navigation }) => {
  const db = getFirestore();
  const user = auth.currentUser;

  // Notification fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("high");
  const [expireOn, setExpireOn] = useState(getDefaultExpiryDate());
  
  // New targeted messaging fields
  const [targetCourse, setTargetCourse] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [targetBatch, setTargetBatch] = useState("");

  // Dropdown open states for priority and new targeting fields
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);

  // Dropdown items
  const [priorityItems, setPriorityItems] = useState([
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ]);
  const [courseItems, setCourseItems] = useState([
    { label: "BCA", value: "BCA" },
    { label: "BBA", value: "BBA" },
    { label: "BVOC", value: "BVOC" },
    // Add more courses as needed
  ]);
  const [yearItems, setYearItems] = useState([
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
  ]);
  const [batchItems, setBatchItems] = useState([
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "C", value: "C" },
  ]);

  const [notifications, setNotifications] = useState([]);
  const [editingNotification, setEditingNotification] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const notificationsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by priority first, then by timestamp (most recent first)
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const sortedNotifications = notificationsList.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.timestamp?.toDate() - a.timestamp?.toDate();
      });

      setNotifications(sortedNotifications);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("LoginScreen");
    } catch (error) {
      Alert.alert("Error", "Logout failed!");
    }
  };

  function getDefaultExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 days from today
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }

  const clearInputFields = () => {
    setTitle("");
    setDescription("");
    setPriority("high");
    setExpireOn(getDefaultExpiryDate());
    setTargetCourse("");
    setTargetYear("");
    setTargetBatch("");
  };

  const handleCreateNotification = async () => {
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        description,
        priority,
        course: targetCourse,
        year: targetYear,
        batch: targetBatch,
        creatorid: user.email,
        timestamp: Timestamp.fromDate(new Date()),
        expire_on: Timestamp.fromDate(new Date(expireOn)),
      });
      Alert.alert("Success", "Notification sent!");
      clearInputFields();
    } catch (error) {
      Alert.alert("Error", "Failed to send notification.");
    }
  };

  const handleDeleteNotification = async (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "notifications", id));
              Alert.alert("Deleted", "Notification removed successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete.");
            }
          },
        },
      ]
    );
  };

  const handleEditNotification = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        title,
        description,
        priority,
        course: targetCourse,
        year: targetYear,
        batch: targetBatch,
        expire_on: Timestamp.fromDate(new Date(expireOn)),
      });
      Alert.alert("Updated", "Notification updated successfully.");
      clearInputFields();
      setEditingNotification(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update.");
    }
  };

  const startEditing = (item) => {
    setEditingNotification(item);
    setTitle(item.title);
    setDescription(item.description);
    setPriority(item.priority);
    setExpireOn(item.expire_on?.toDate()?.toISOString().split("T")[0] || getDefaultExpiryDate());
    setTargetCourse(item.course || "");
    setTargetYear(item.year || "");
    setTargetBatch(item.batch || "");
  };

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
      <Text style={styles.heading}>Create Notification</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline style={styles.input} />
      
      <View style={{ zIndex: 4000, elevation: 4000 }}>
      <DropDownPicker
        open={courseOpen}
        value={targetCourse}
        items={courseItems}
        setOpen={setCourseOpen}
        setValue={setTargetCourse}
        setItems={setCourseItems}
        placeholder="Select Course"
        containerStyle={{ marginBottom: 10 }}
        style={styles.picker}
        dropDownContainerStyle={{ backgroundColor: "#fff" }}
      />
      </View>
      
      <View style={{ zIndex: 3000, elevation: 3000 }}>
      {/* Targeting by Year */}
      <DropDownPicker
        open={yearOpen}
        value={targetYear}
        items={yearItems}
        setOpen={setYearOpen}
        setValue={setTargetYear}
        setItems={setYearItems}
        placeholder="Select Year"
        containerStyle={{ marginBottom: 10 }}
        style={styles.picker}
        dropDownContainerStyle={{ backgroundColor: "#fff" }}
      />
      </View>

      <View style={{ zIndex: 2000, elevation: 2000 }}>
      {/* Targeting by Batch */}
      <DropDownPicker
        open={batchOpen}
        value={targetBatch}
        items={batchItems}
        setOpen={setBatchOpen}
        setValue={setTargetBatch}
        setItems={setBatchItems}
        placeholder="Select Batch"
        containerStyle={{ marginBottom: 10 }}
        style={styles.picker}
        dropDownContainerStyle={{ backgroundColor: "#fff" }}
      />
      </View>

      <TextInput
        placeholder="Expires On (YYYY-MM-DD)"
        value={expireOn}
        onChangeText={setExpireOn}
        style={styles.input}
      />

      <View style={{ zIndex: 1000, elevation: 1000 }}>
      <DropDownPicker
        open={priorityOpen}
        value={priority}
        items={priorityItems}
        setOpen={setPriorityOpen}
        setValue={setPriority}
        setItems={setPriorityItems}
        containerStyle={{ marginBottom: 10 }}
        style={styles.picker}
        dropDownContainerStyle={{ backgroundColor: "#fff" }}
      />
      </View>

      <Button
        title={editingNotification ? "Update Notification" : "Send Notification"}
        onPress={editingNotification ? () => handleEditNotification(editingNotification.id) : handleCreateNotification}
      />

      <Text style={styles.heading}>All Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.timestamp}>Priority: {item.priority.toUpperCase()}</Text>
            <Text style={styles.timestamp}>Course: {item.course || "Any"}</Text>
            <Text style={styles.timestamp}>Year: {item.year || "Any"}</Text>
            <Text style={styles.timestamp}>Batch: {item.batch || "Any"}</Text>
            <Text style={styles.timestamp}>Created: {item.timestamp?.toDate()?.toLocaleString()}</Text>
            <Text style={styles.timestamp}>Expires On: {item.expire_on?.toDate()?.toLocaleDateString()}</Text>

            <TouchableOpacity onPress={() => handleDeleteNotification(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => startEditing(item)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  picker: { height: 40, marginVertical: 5 },
  card: { padding: 15, marginVertical: 8, borderRadius: 8, elevation: 3 },
  title: { fontSize: 18, fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#999", marginTop: 5 },
  deleteButton: { color: "red", marginTop: 5 },
  editButton: { color: "blue", marginTop: 5 },
  logoutButton: { marginRight: 10 },
  logoutText: { color: "red", fontWeight: "bold" },
});

export default AdminDashboard;
