import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@checklist_state_v1';

export default function HomeScreen({ onOpenList, onOpenJsonViewer }) {
  const [data, setData] = useState({ lists: [], activeIndex: 0 });
  const [editingIdx, setEditingIdx] = useState(null);
  const [tempName, setTempName] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed)) {
            setData({ lists: [{ name: 'Lista 1', items: parsed }], activeIndex: 0 });
          } else if (parsed && parsed.lists) {
            setData(parsed);
          }
        } else {
          setData({ lists: [{ name: 'Lista 1', items: [] }], activeIndex: 0 });
        }
      } catch (e) {
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(e => {});
  }, [data]);

  function selectList(i) {
    setData(prev => ({ ...prev, activeIndex: i }));
    if (onOpenList) onOpenList();
  }

  function addList() {
    const name = (newName || `Lista ${data.lists.length + 1}`).trim();
    setData(prev => ({ ...prev, lists: [...prev.lists, { name, items: [] }], activeIndex: prev.lists.length }));
    setNewName('');
  }

  function startRename(i) {
    setEditingIdx(i);
    setTempName(data.lists[i].name);
  }

  function saveRename(i) {
    const name = (tempName || '').trim();
    if (!name) { Alert.alert('Nome inválido'); return; }
    setData(prev => { const lists = prev.lists.map((l, idx) => idx === i ? { ...l, name } : l); return { ...prev, lists }; });
    setEditingIdx(null);
  }

  function deleteList(i) {
    if (data.lists.length <= 1) { Alert.alert('Pelo menos uma lista deve existir'); return; }
    Alert.alert('Excluir', 'Confirma excluir?', [ { text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => {
      setData(prev => { const lists = prev.lists.filter((_, idx) => idx !== i); const activeIndex = Math.max(0, prev.activeIndex - 1); return { lists, activeIndex }; });
    } } ]);
  }

  return (
    <View style={styles.root}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={styles.title}>Minhas Listas</Text>
        <TouchableOpacity style={[styles.addBtn, {alignSelf: 'center'}]} onPress={onOpenJsonViewer}>
          <Text style={{color: '#fff'}}>Visualizar JSON</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data.lists}
        keyExtractor={(l, idx) => l.name + idx}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <TouchableOpacity style={styles.select} onPress={() => selectList(index)}>
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
            {editingIdx === index ? (
              <View style={styles.renameRow}>
                <TextInput value={tempName} onChangeText={setTempName} style={styles.input} />
                <TouchableOpacity onPress={() => saveRename(index)} style={styles.okBtn}><Ionicons name="checkmark" size={18} color="#fff" /></TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => startRename(index)} style={styles.iconBtn}><Ionicons name="pencil" size={18} color="#333" /></TouchableOpacity>
                <TouchableOpacity onPress={() => deleteList(index)} style={styles.iconBtn}><Ionicons name="trash" size={18} color="#c0392b" /></TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <View style={styles.addRow}>
        <TextInput placeholder="Nome da nova lista (opcional)" value={newName} onChangeText={setNewName} style={styles.input} />
        <TouchableOpacity onPress={addList} style={styles.addBtn}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8 },
  select: { flex: 1 },
  name: { fontSize: 16 },
  actions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 8, padding: 6 },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6 },
  addBtn: { backgroundColor: '#2c3e50', padding: 10, borderRadius: 6, marginLeft: 8 },
  renameRow: { flexDirection: 'row', alignItems: 'center' },
  okBtn: { backgroundColor: '#27ae60', padding: 6, borderRadius: 6, marginLeft: 8 }
});
