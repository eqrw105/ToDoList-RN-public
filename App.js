import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal, Dimensions, Vibration, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './colors';
import { Feather, AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [working, setWorking] = useState(true);
  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editItem, setEditItem] = useState();

  const TODOS_STORAGE_KEY = "@toDos";
  const WORKING_STORAGE_KEY = "@working";

  const onChangeText = (e) => {
    setText(e);
  };
  const onChangeEditText = (e) => {
    setEditText(e);
  };
  const addToDo = () => {
    if (text === "") {
      return
    }
    const newToDos = { ...toDos, [Date.now()]: { text: text, work: working, completed: false } };
    setToDos(newToDos);
    // save to do
    saveToDos(newToDos);
    setText("");
  };
  const editToDo = (key) => {
    if (editText === "") {
      setEditItem(null);
      return
    }
    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditText("");
    setEditItem(null);
  }
  const saveToDos = async (toSave) => {
    try {
      const s = JSON.stringify(toSave);
      if(s === null) {
        return
      }
      await AsyncStorage.setItem(TODOS_STORAGE_KEY, s);
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
      if(s === null) {
        return
      }
      const toDos = JSON.parse(s);
      setToDos(toDos);
    } catch (e) {
      console.log(e);
    }
  };
  const deleteToDos = async (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      { text: "I'm Sure", onPress: () => {
        const newToDos = { ...toDos };
    delete newToDos[key];
    setToDos(newToDos);
    saveToDos(newToDos);
      } }
    ]);
  };
  const updateToDos = (editItem) => {
    setEditText("");
    setEditItem(editItem);
  };
  const completeToDos = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
    Vibration.vibrate();
  };

  const saveWorking = async (toSave) => {
    try {
      const s = JSON.stringify(toSave);
      await AsyncStorage.setItem(WORKING_STORAGE_KEY, s);
    } catch(e) {
      console.log(e);
    }
  };

  const loadWorking = async () => {
    try {
      const loadWorking = await AsyncStorage.getItem(WORKING_STORAGE_KEY);
      if(loadWorking === null) {
        return work()
      }
      Boolean(JSON.parse(loadWorking))? work() : travel()
    } catch(e) {
      console.log(e);
    }
  }

  useEffect(() => {
    loadToDos();
    loadWorking();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          returnKeyType={"done"}
          value={text}
          placeholder={working ? "ADD a To Do" : "Where do you want to go?"}
          style={styles.input} />
      </View>
      {toDos === null || toDos.length === 0 ? <ActivityIndicator color={"white"} size={"large"}/> : (<ScrollView>
        {Object.keys(toDos).map((key) => (
          toDos[key].work === working ? <View style={styles.toDo} key={key}>
            {editItem === key? <TextInput
            style={styles.toDoText}
            onChangeText={onChangeEditText}
            autoFocus={true}
            value={editText}></TextInput> : <Text style={{ ...styles.toDoText, textDecorationLine: toDos[key].completed ? 'line-through' : null }} numberOfLines={1} ellipsizeMode={'tail'}>{toDos[key].text}</Text>}
            <View style={styles.optionContainer}>
            {editItem !== key? <Feather style={styles.option} name='check-circle' size={18} color={theme.grey} onPress={() => completeToDos(key)}/> : null}
            {editItem !== key? <AntDesign style={styles.option} name='edit' size={18} color={theme.grey} onPress={() => updateToDos(key)}/> : null}
            {editItem !== key? <Feather style={styles.option} name='delete' size={18} color={theme.grey} onPress={() => deleteToDos(key)}/> : null}
            {editItem === key? <FontAwesome5 style={styles.option} name='save' size={18} color={theme.grey} onPress={() => editToDo(key)}/> : null}
            {editItem === key? <Ionicons  style={styles.option} name='arrow-back' size={18} color={theme.grey} onPress={() => setEditItem(null)}/> : null}
            </View>
          </View> : null
        ))}
      </ScrollView>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    marginTop: 100,
    flexDirection: "row",
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 14,
    marginVertical: 20
  },
  toDo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    width: SCREEN_WIDTH / 2,
    textAlignVertical: 'center',
    height: 25
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: 'center'
  },
  option: {
    marginHorizontal: 5,
  }
});
