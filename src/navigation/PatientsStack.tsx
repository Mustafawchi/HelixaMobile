import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../screens/patients/MainScreen';
import NoteListScreen from '../screens/noteList/NoteListScreen';
import NewNoteScreen from '../screens/newNote/newNoteScreen';
import NoteDetailScreen from '../screens/noteDetail/noteDetailScreen';
import type { PatientsStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<PatientsStackParamList>();

export default function PatientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientList" component={MainScreen} />
      <Stack.Screen name="NoteList" component={NoteListScreen} />
      <Stack.Screen name="NewNote" component={NewNoteScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
    </Stack.Navigator>
  );
}
