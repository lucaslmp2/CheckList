import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function JSONViewerScreen({ onBack }) {
  const [importedData, setImportedData] = useState(null);
  const [selectedListIndex, setSelectedListIndex] = useState(0); // To keep track of the active list

  async function importFromClipboard() {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text) {
        Alert.alert('Clipboard vazio', 'Copie o JSON para o clipboard primeiro.');
        return;
      }

      try {
        const parsed = JSON.parse(text);

        // Validate the new JSON structure
        if (
          parsed &&
          Array.isArray(parsed.lists) &&
          parsed.lists.every(list =>
            list.name && typeof list.name === 'string' &&
            list.date && typeof list.date === 'string' &&
            Array.isArray(list.items) &&
            list.items.every(item =>
              item.name && typeof item.name === 'string' &&
              typeof item.checked === 'boolean' &&
              typeof item.qty === 'number'
            )
          ) &&
          typeof parsed.activeIndex === 'number' &&
          parsed.activeIndex >= 0 && parsed.activeIndex < parsed.lists.length
        ) {
          setImportedData(parsed);
          setSelectedListIndex(parsed.activeIndex);
        } else {
          Alert.alert(
            'Formato de JSON Inválido',
            'O JSON importado não corresponde ao formato esperado de listas de checklist.'
          );
        }
      } catch (parseError) {
        const snippet = text.substring(0, 150);
        Alert.alert(
          'Erro de Análise de JSON',
          `O texto no clipboard não é um JSON válido.\n\nErro: ${parseError.message}\n\nInício do conteúdo (${text.length} caracteres):\n"${snippet}${text.length > 150 ? '...' : ''}"`
        );
      }
    } catch (clipboardError) {
      Alert.alert('Erro ao ler clipboard', `Não foi possível ler o conteúdo do clipboard.\n\n${clipboardError.message}`);
    }
  }

  const renderItemRow = ({ item, index }) => (
    <View style={[styles.itemRow, { backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff' }]}>
      <Ionicons
        name={item.checked ? 'checkbox-outline' : 'square-outline'}
        size={20}
        color={item.checked ? '#27ae60' : '#7f8c8d'}
        style={{ marginRight: 10 }}
      />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemQty}>x{item.qty}</Text>
    </View>
  );

  const renderListSelector = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      style={[styles.listSelectorButton, selectedListIndex === index && styles.listSelectorButtonActive]}
      onPress={() => setSelectedListIndex(index)}
    >
      <Text style={[styles.listSelectorText, selectedListIndex === index && styles.listSelectorTextActive]}>
        {item.name} ({item.date})
      </Text>
    </TouchableOpacity>
  );

  const currentList = importedData ? importedData.lists[selectedListIndex] : null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity style={{ marginRight: 8, padding: 6 }} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#3498e0" />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title}>Importar Listas</Text>
      </View>

      <TouchableOpacity style={styles.importBtn} onPress={importFromClipboard}>
        <Ionicons name="clipboard-outline" size={20} color="#fff" />
        <Text style={{ color: '#fff', marginLeft: 10, fontWeight: '600' }}>Importar Listas do Clipboard</Text>
      </TouchableOpacity>

      {importedData ? (
        <View style={{ flex: 1, marginTop: 16 }}>
          {importedData.lists.length > 1 && (
            <FlatList
              data={importedData.lists}
              renderItem={renderListSelector}
              keyExtractor={(item, index) => `list-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.listSelectorContainer}
            />
          )}

          {currentList && (
            <View style={styles.currentListContainer}>
              <Text style={styles.currentListName}>{currentList.name}</Text>
              <Text style={styles.currentListDate}>{currentList.date}</Text>
              <FlatList
                data={currentList.items}
                renderItem={renderItemRow}
                keyExtractor={(item, index) => `item-${index}`}
                style={styles.itemsList}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            Nenhuma lista importada ainda.
          </Text>
          <Text style={styles.emptySubText}>
            Copie o JSON de uma ou mais listas para o clipboard e clique no botão acima.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#fdfdfd' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  importBtn: { flexDirection: 'row', backgroundColor: '#3498db', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },

  listSelectorContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 10,
  },
  listSelectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  listSelectorButtonActive: {
    backgroundColor: '#3498db',
  },
  listSelectorText: {
    color: '#555',
    fontWeight: '500',
  },
  listSelectorTextActive: {
    color: '#fff',
  },

  currentListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  currentListName: {
    fontSize: 20,
    fontWeight: '700',
    padding: 15,
    paddingBottom: 5,
    color: '#2c3e50',
  },
  currentListDate: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    marginBottom: 5,
  },
  itemsList: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ecf0f1',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#34495e',
  },
  itemQty: {
    fontSize: 15,
    color: '#7f8c8d',
    marginLeft: 10,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    color: '#7f8c8d',
    fontSize: 18,
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    color: '#95a5a6',
    fontSize: 14,
    textAlign: 'center',
  }
});
