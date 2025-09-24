import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput, useWindowDimensions, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { items as initialItems } from './data/items';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const STORAGE_KEY = '@checklist_state_v1';

function makeInitialItems() {
  return initialItems.map(name => ({ name, checked: false, qty: 1 }));
}

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0,10);
}

function makeInitialData() {
  return {
    lists: [
      { name: 'Lista 1', date: todayISO(), items: makeInitialItems() }
    ],
    activeIndex: 0
  };
}

export default function ChecklistScreen({ onBack } = {}) {
  const [data, setData] = useState(makeInitialData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json);
          // migration: older format was an array of items OR had days arrays
          if (Array.isArray(parsed)) {
            // create a list for today
            const items = parsed.map(it => ({ name: it.name, checked: !!(it.checked), qty: it.qty || 1 }));
            setData({ lists: [{ name: 'Lista 1', date: todayISO(), items }], activeIndex: 0 });
          } else if (parsed && parsed.lists) {
            // if items had days[], map to checked based on today's weekday
            const todayIdx = new Date().getDay(); // 0..6 (Sun..Sat)
            const lists = parsed.lists.map(l => ({
              name: l.name,
              date: l.date || todayISO(),
              items: (l.items || []).map(it => {
                if (it.days && Array.isArray(it.days)) {
                  return { name: it.name, checked: !!it.days[todayIdx], qty: it.qty || 1 };
                }
                return { name: it.name, checked: !!it.checked, qty: it.qty || 1 };
              })
            }));
            // If parsed.lists is empty, populate with default items to avoid an empty UI
            if (!lists || lists.length === 0) {
              setData(makeInitialData());
            } else {
              setData({ lists, activeIndex: parsed.activeIndex || 0 });
            }
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar estado:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(e => console.warn(e));
  }, [data, loaded]);

  const lists = data.lists || [];
  const activeIndex = typeof data.activeIndex === 'number' ? data.activeIndex : 0;
  const activeList = lists[activeIndex] || { name: 'Lista', date: todayISO(), items: makeInitialItems() };
  const items = activeList.items || [];

  function updateActiveItems(updater) {
    setData(prev => {
      const copy = { lists: prev.lists.map(l => ({ ...l, items: (l.items || []).map(it => ({ ...it })) })), activeIndex: prev.activeIndex };
      copy.lists[activeIndex].items = updater(copy.lists[activeIndex].items);
      return copy;
    });
  }

  function toggleChecked(itemIndex) {
    updateActiveItems(items => {
      const copy = items.map(it => ({ ...it }));
      copy[itemIndex].checked = !copy[itemIndex].checked;
      return copy;
    });
  }

  function changeQty(itemIndex, delta) {
    updateActiveItems(items => {
      const copy = items.map(it => ({ ...it }));
      copy[itemIndex].qty = Math.max(0, (copy[itemIndex].qty || 0) + delta);
      return copy;
    });
  }

  function resetActiveList() {
    Alert.alert('Resetar', 'Deseja resetar todas as marcações da lista atual?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Resetar', style: 'destructive', onPress: () => {
        updateActiveItems(() => makeInitialItems());
      } }
    ]);
  }

  async function exportJSON() {
    try {
      const payload = JSON.stringify(data, null, 2);
      await Share.share({
        message: payload,
        title: 'Exportar dados do Checklist'
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  }

  async function copyJSON() {
    try {
      const payload = JSON.stringify(data, null, 2);
      await Clipboard.setStringAsync(payload);
      Alert.alert('Sucesso', 'Dados do checklist copiados para o clipboard!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar os dados para o clipboard.');
    }
  }

  function addList() {
    setData(prev => {
      const nextName = `Lista ${prev.lists.length + 1}`;
      const copy = { ...prev, lists: [...prev.lists, { name: nextName, items: makeInitialItems() }], activeIndex: prev.lists.length };
      return copy;
    });
  }

  function deleteActiveList() {
    if (data.lists.length <= 1) {
      Alert.alert('Aviso', 'Pelo menos uma lista deve existir');
      return;
    }
    Alert.alert('Excluir lista', 'Deseja excluir a lista atual?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
        setData(prev => {
          const lists = prev.lists.filter((_, i) => i !== prev.activeIndex);
          const newIndex = Math.max(0, prev.activeIndex - 1);
          return { lists, activeIndex: newIndex };
        });
      } }
    ]);
  }

  function switchList(dir) {
    setData(prev => ({ ...prev, activeIndex: Math.max(0, Math.min(prev.lists.length - 1, prev.activeIndex + dir)) }));
  }

  function countChecked() {
    return items.reduce((s, it) => s + (it.checked ? (it.qty || 1) : 0), 0);
  }

  const checkedCount = countChecked();

  const [newItemName, setNewItemName] = useState('');
  const [dateText, setDateText] = useState(activeList.date || todayISO());

  function addItem() {
    const name = (newItemName || '').trim();
    if (!name) {
      Alert.alert('Aviso', 'Digite o nome do item');
      return;
    }
    updateActiveItems(items => [...items, { name, days: [false,false,false,false,false,false,false], qty: 1 }]);
    setNewItemName('');
  }

  function updateListDate(newIso) {
    // validate YYYY-MM-DD quickly
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(newIso)) {
      Alert.alert('Data inválida', 'Use o formato YYYY-MM-DD');
      return;
    }
    setData(prev => {
      const lists = prev.lists.map((l, i) => i === activeIndex ? { ...l, date: newIso } : l);
      return { ...prev, lists };
    });
    setDateText(newIso);
  }

  function changeDateOffset(offset) {
    const d = new Date(dateText);
    d.setDate(d.getDate() + offset);
    const iso = d.toISOString().slice(0,10);
    updateListDate(iso);
  }

  const { width } = useWindowDimensions();
  const isCompact = width < 520; // portrait narrow

  return (
    <View style={styles.root}>
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: isCompact ? 'wrap' : 'nowrap' }}>
          {onBack ? (
            <TouchableOpacity style={{ marginRight: 8, padding: 6 }} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color="#333" />
            </TouchableOpacity>
          ) : null}
          <Text style={[styles.title, isCompact && { fontSize: 18 }]}>CHECK LIST</Text>
          <View style={[ { marginLeft: 12, flexDirection: 'row', alignItems: 'center' }, isCompact && { marginLeft: 0, marginTop: 8, flexWrap: 'wrap' } ]}>
            <TouchableOpacity style={styles.listBtn} onPress={() => switchList(-1)}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.listName}>{lists[activeIndex].name}</Text>
            <TouchableOpacity style={styles.listBtn} onPress={() => switchList(1)}>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={addList}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#c0392b' }]} onPress={deleteActiveList}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={copyJSON}>
              <Ionicons name="copy-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={exportJSON}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dateControls}>
          <TouchableOpacity style={styles.iconSmall} onPress={() => changeDateOffset(-1)}>
            <Ionicons name="chevron-back" size={18} color="#333" />
          </TouchableOpacity>
          <TextInput value={dateText} onChangeText={setDateText} onEndEditing={() => updateListDate(dateText)} style={styles.dateInput} />
          <TouchableOpacity style={styles.iconSmall} onPress={() => changeDateOffset(1)}>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12, alignItems: 'center' }}>
            <Text style={styles.small}>Total: {checkedCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.addRow}>
        <TextInput placeholder="Adicionar novo item" value={newItemName} onChangeText={setNewItemName} style={styles.input} />
        <TouchableOpacity style={styles.addBtnMain} onPress={addItem}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={items}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={() => (
            <View style={[styles.row, styles.headerRow]}>
              <View style={[styles.itemCol, { flex: 1 }]}><Text style={styles.colHeader}>ITEM</Text></View>
              <View style={{ width: 120, alignItems: 'center' }}><Text style={styles.colHeader}>Qtd</Text></View>
              <View style={{ width: 80, alignItems: 'center' }}><Text style={styles.colHeader}>Feito</Text></View>
            </View>
          )}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          ListEmptyComponent={() => (
            <Text style={{ padding: 12, color: '#666' }}>Nenhum item nesta lista</Text>
          )}
          keyExtractor={(it, idx) => it.name + idx}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={[styles.itemCol, { flex: 1 }]}>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
              <View style={{ width: 120, alignItems: 'center' }}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(index, -1)}>
                    <Ionicons name="remove" size={16} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty || 0}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(index, 1)}>
                    <Ionicons name="add" size={16} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ width: 80, alignItems: 'center' }}>
                <TouchableOpacity style={[styles.checkBtn, item.checked && styles.checked]} onPress={() => toggleChecked(index)}>
                  {item.checked ? <Ionicons name="checkmark" size={18} color="#fff" /> : <Text />}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  actions: { flexDirection: 'row' },
  actionBtn: { backgroundColor: '#2c3e50', padding: 8, borderRadius: 6, marginHorizontal: 4 },
  listBtn: { backgroundColor: '#34495e', padding: 6, borderRadius: 6, marginHorizontal: 4 },
  listName: { color: '#222', fontWeight: '600', marginHorizontal: 4, paddingHorizontal: 6 },
  table: { minWidth: 980 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerRow: { backgroundColor: '#f5f5f5' },
  itemCol: { width: 360, padding: 8 },
  dayCol: { width: 80, padding: 8, alignItems: 'center', justifyContent: 'center' },
  dayColHeader: { width: 80, padding: 8, alignItems: 'center', justifyContent: 'center' },
  colHeader: { fontWeight: '700' },
  small: { fontSize: 12, color: '#666' },
  itemText: { fontSize: 14 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  qtyBtn: { backgroundColor: '#e6e6e6', padding: 4, borderRadius: 4 },
  qtyText: { marginHorizontal: 8, minWidth: 24, textAlign: 'center' },
  checked: { backgroundColor: '#27ae60', borderRadius: 4 }
  ,addRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6, marginRight: 8 },
  addBtnMain: { backgroundColor: '#2c3e50', padding: 10, borderRadius: 6 }
  ,headerCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  actionsCompact: { flexDirection: 'row', marginTop: 8 }
  ,dateControls: { flexDirection: 'row', alignItems: 'center', marginTop: 8 }
  ,iconSmall: { padding: 6 }
  ,dateInput: { borderWidth: 1, borderColor: '#ddd', padding: 6, borderRadius: 6, minWidth: 120, textAlign: 'center' }
  ,tableSingle: { minWidth: 320 }
  ,checkBtn: { width: 40, height: 36, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' }
});