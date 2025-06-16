/**
 * Unified storage service with local-first approach and cloud sync
 * Uses IndexedDB for local storage and Supabase for cloud storage
 */

import { supabase } from './supabase';

// Type definitions
interface LocalRecord {
  id?: number;
  synced?: boolean;
  updated_at?: Date;
  [key: string]: any;
}

// IndexedDB setup for local storage
const DB_NAME = 'ProjectManagerDB';
const DB_VERSION = 1;
const STORES = {
  projects: 'projects',
  cameras: 'cameras',
  accessPoints: 'access_points',
  elevators: 'elevators',
  intercoms: 'intercoms',
  files: 'files',
  images: 'images',
  syncQueue: 'sync_queue'
};

class LocalStorageService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            
            // Add indexes for common queries
            if (storeName !== 'sync_queue') {
              store.createIndex('project_id', 'project_id', { unique: false });
              store.createIndex('updated_at', 'updated_at', { unique: false });
            }
          }
        });
      };
    });
  }

  async get<T>(storeName: string, id: string | number): Promise<T | null> {
    await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAll<T>(storeName: string, projectId?: number): Promise<T[]> {
    await this.initDB();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = projectId 
        ? store.index('project_id').getAll(projectId)
        : store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async save<T extends LocalRecord>(storeName: string, data: T): Promise<T> {
    await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    const dataWithTimestamp: LocalRecord = {
      ...data,
      updated_at: new Date(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = data.id ? store.put(dataWithTimestamp) : store.add(dataWithTimestamp);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = { ...dataWithTimestamp, id: request.result as number };
        this.addToSyncQueue(storeName, result.id, 'upsert');
        resolve(result as T);
      };
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.addToSyncQueue(storeName, id, 'delete');
        resolve();
      };
    });
  }

  async saveFile(file: File, projectId: number): Promise<string> {
    await this.initDB();
    
    const fileData: any = {
      project_id: projectId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: await this.fileToArrayBuffer(file),
      created_at: new Date(),
      synced: false
    };

    const savedFile = await this.save(STORES.files, fileData);
    return `local_${savedFile.id}`;
  }

  async saveImage(imageData: string, projectId: number, equipmentType: string, equipmentId: number): Promise<string> {
    await this.initDB();
    
    const imageRecord: LocalRecord = {
      project_id: projectId,
      equipment_type: equipmentType,
      equipment_id: equipmentId,
      data: imageData,
      created_at: new Date(),
      synced: false
    };

    const savedImage = await this.save(STORES.images, imageRecord);
    return `local_${savedImage.id!}`;
  }

  async getFile(fileId: string): Promise<{ name: string; data: ArrayBuffer; type: string } | null> {
    if (!fileId.startsWith('local_')) return null;
    
    const id = parseInt(fileId.replace('local_', ''));
    const file = await this.get<any>(STORES.files, id);
    
    return file ? {
      name: file.name,
      data: file.data,
      type: file.type
    } : null;
  }

  async getImage(imageId: string): Promise<string | null> {
    if (!imageId.startsWith('local_')) return null;
    
    const id = parseInt(imageId.replace('local_', ''));
    const image = await this.get<any>(STORES.images, id);
    
    return image?.data || null;
  }

  private async addToSyncQueue(storeName: string, recordId: number, action: 'upsert' | 'delete'): Promise<void> {
    const syncItem = {
      store_name: storeName,
      record_id: recordId,
      action,
      created_at: new Date()
    };

    await this.save(STORES.syncQueue, syncItem);
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

class CloudStorageService {
  async isOnline(): Promise<boolean> {
    if (!navigator.onLine) return false;
    
    try {
      const { data, error } = await supabase.auth.getSession();
      return !error && !!data.session;
    } catch {
      return false;
    }
  }

  async syncProject(project: any): Promise<any> {
    const { data, error } = await supabase
      .from('projects')
      .upsert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async syncCamera(camera: any): Promise<any> {
    const { data, error } = await supabase
      .from('cameras')
      .upsert(camera)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async syncAccessPoint(accessPoint: any): Promise<any> {
    const { data, error } = await supabase
      .from('access_points')
      .upsert(accessPoint)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async syncElevator(elevator: any): Promise<any> {
    const { data, error } = await supabase
      .from('elevators')
      .upsert(elevator)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async syncIntercom(intercom: any): Promise<any> {
    const { data, error } = await supabase
      .from('intercoms')
      .upsert(intercom)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async uploadFile(file: File, projectId: number): Promise<string> {
    const fileName = `project_${projectId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  async uploadImage(imageData: string, projectId: number, equipmentType: string, equipmentId: number): Promise<string> {
    const fileName = `project_${projectId}/${equipmentType}_${equipmentId}_${Date.now()}.jpg`;
    
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(fileName, blob);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  async deleteFile(fileName: string): Promise<void> {
    const { error } = await supabase.storage
      .from('project-files')
      .remove([fileName]);
    
    if (error) throw error;
  }

  async deleteImage(fileName: string): Promise<void> {
    const { error } = await supabase.storage
      .from('project-images')
      .remove([fileName]);
    
    if (error) throw error;
  }
}

class SyncService {
  private localStorage = new LocalStorageService();
  private cloudStorage = new CloudStorageService();
  private syncInProgress = false;

  async sync(): Promise<void> {
    if (this.syncInProgress) return;
    
    const isOnline = await this.cloudStorage.isOnline();
    if (!isOnline) return;

    this.syncInProgress = true;
    
    try {
      // Get all items in sync queue
      const syncQueue = await this.localStorage.getAll<any>(STORES.syncQueue);
      
      for (const syncItem of syncQueue) {
        try {
          await this.processSyncItem(syncItem);
          await this.localStorage.delete(STORES.syncQueue, syncItem.id);
        } catch (error) {
          console.error('Sync failed for item:', syncItem, error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(syncItem: any): Promise<void> {
    const { store_name, record_id, action } = syncItem;
    
    if (action === 'delete') {
      // Handle delete operations
      return;
    }
    
    // Get the record from local storage
    const record = await this.localStorage.get(store_name, record_id);
    if (!record) return;
    
    // Sync based on store type
    switch (store_name) {
      case STORES.projects:
        await this.cloudStorage.syncProject(record);
        break;
      case STORES.cameras:
        await this.cloudStorage.syncCamera(record);
        break;
      case STORES.accessPoints:
        await this.cloudStorage.syncAccessPoint(record);
        break;
      case STORES.elevators:
        await this.cloudStorage.syncElevator(record);
        break;
      case STORES.intercoms:
        await this.cloudStorage.syncIntercom(record);
        break;
    }
    
    // Mark as synced
    await this.localStorage.save(store_name, { ...record, synced: true });
  }

  startPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      this.sync().catch(console.error);
    }, 30000);
    
    // Sync when coming back online
    window.addEventListener('online', () => {
      setTimeout(() => this.sync().catch(console.error), 1000);
    });
  }
}

// Unified storage interface
export class UnifiedStorageService {
  private localStorage = new LocalStorageService();
  private cloudStorage = new CloudStorageService();
  private syncService = new SyncService();

  constructor() {
    this.syncService.startPeriodicSync();
  }

  // Project operations
  async saveProject(project: any): Promise<any> {
    const localResult = await this.localStorage.save(STORES.projects, project);
    
    if (await this.cloudStorage.isOnline()) {
      try {
        await this.cloudStorage.syncProject(localResult);
      } catch (error) {
        console.log('Cloud sync failed, will retry later:', error);
      }
    }
    
    return localResult;
  }

  async getProjects(): Promise<any[]> {
    return this.localStorage.getAll(STORES.projects);
  }

  async getProject(id: number): Promise<any | null> {
    return this.localStorage.get(STORES.projects, id);
  }

  // Camera operations
  async saveCamera(camera: any): Promise<any> {
    const localResult = await this.localStorage.save(STORES.cameras, camera);
    
    if (await this.cloudStorage.isOnline()) {
      try {
        await this.cloudStorage.syncCamera(localResult);
      } catch (error) {
        console.log('Cloud sync failed, will retry later:', error);
      }
    }
    
    return localResult;
  }

  async getCameras(projectId: number): Promise<any[]> {
    return this.localStorage.getAll(STORES.cameras, projectId);
  }

  // Access Point operations
  async saveAccessPoint(accessPoint: any): Promise<any> {
    const localResult = await this.localStorage.save(STORES.accessPoints, accessPoint);
    
    if (await this.cloudStorage.isOnline()) {
      try {
        await this.cloudStorage.syncAccessPoint(localResult);
      } catch (error) {
        console.log('Cloud sync failed, will retry later:', error);
      }
    }
    
    return localResult;
  }

  async getAccessPoints(projectId: number): Promise<any[]> {
    return this.localStorage.getAll(STORES.accessPoints, projectId);
  }

  // File operations
  async saveFile(file: File, projectId: number): Promise<string> {
    // Always save locally first
    const localFileId = await this.localStorage.saveFile(file, projectId);
    
    // Try to upload to cloud if online
    if (await this.cloudStorage.isOnline()) {
      try {
        const cloudUrl = await this.cloudStorage.uploadFile(file, projectId);
        return cloudUrl;
      } catch (error) {
        console.log('Cloud upload failed, using local storage:', error);
      }
    }
    
    return localFileId;
  }

  async getFile(fileId: string): Promise<{ name: string; data: ArrayBuffer; type: string } | null> {
    if (fileId.startsWith('local_')) {
      return this.localStorage.getFile(fileId);
    }
    
    // For cloud URLs, return fetch result
    try {
      const response = await fetch(fileId);
      const data = await response.arrayBuffer();
      const fileName = fileId.split('/').pop() || 'unknown';
      
      return {
        name: fileName,
        data,
        type: response.headers.get('content-type') || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Failed to fetch cloud file:', error);
      return null;
    }
  }

  // Image operations
  async saveImage(imageData: string, projectId: number, equipmentType: string, equipmentId: number): Promise<string> {
    // Always save locally first
    const localImageId = await this.localStorage.saveImage(imageData, projectId, equipmentType, equipmentId);
    
    // Try to upload to cloud if online
    if (await this.cloudStorage.isOnline()) {
      try {
        const cloudUrl = await this.cloudStorage.uploadImage(imageData, projectId, equipmentType, equipmentId);
        return cloudUrl;
      } catch (error) {
        console.log('Cloud upload failed, using local storage:', error);
      }
    }
    
    return localImageId;
  }

  async getImage(imageId: string): Promise<string | null> {
    if (imageId.startsWith('local_')) {
      return this.localStorage.getImage(imageId);
    }
    
    // For cloud URLs, return as is
    return imageId;
  }

  // Sync operations
  async forcSync(): Promise<void> {
    await this.syncService.sync();
  }

  async isOnline(): Promise<boolean> {
    return this.cloudStorage.isOnline();
  }
}

// Export singleton instance
export const storage = new UnifiedStorageService();