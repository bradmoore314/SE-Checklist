import { 
  AccessPoint, 
  InsertAccessPoint, 
  Camera, 
  InsertCamera, 
  Elevator, 
  InsertElevator, 
  Intercom, 
  InsertIntercom 
} from './schema';

/**
 * Union type for equipment types supported in the application
 */
export type GenericEquipmentType = AccessPoint | Camera | Elevator | Intercom;

/**
 * Union type for insert equipment types
 */
export type GenericInsertEquipmentType = InsertAccessPoint | InsertCamera | InsertElevator | InsertIntercom;

/**
 * Common equipment fields
 */
export interface CommonEquipmentFields {
  id: number;
  project_id: number;
  location: string | null;
  notes: string | null;
  status?: string;
}

/**
 * Utility functions for working with equipment types
 */
export const getEquipmentTypeLabel = (type: string): string => {
  switch (type) {
    case 'access_point':
      return 'Access Point';
    case 'camera':
      return 'Camera';
    case 'elevator':
      return 'Elevator';
    case 'intercom':
      return 'Intercom';
    default:
      return 'Equipment';
  }
};

export const getEquipmentTypeIcon = (type: string): string => {
  switch (type) {
    case 'access_point':
      return 'door-open';
    case 'camera':
      return 'video';
    case 'elevator':
      return 'arrow-up-square';
    case 'intercom':
      return 'phone';
    default:
      return 'box';
  }
};

export const getEquipmentTypeColor = (type: string): string => {
  switch (type) {
    case 'access_point':
      return 'blue';
    case 'camera':
      return 'red';
    case 'elevator':
      return 'green';
    case 'intercom':
      return 'purple';
    default:
      return 'gray';
  }
};