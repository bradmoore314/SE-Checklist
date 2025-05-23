import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * Unified equipment duplication utility
 * Consolidates all duplication logic from across the app
 */

export interface DuplicationOptions {
  quantity?: number;
  prefix?: string;
  suffix?: string;
  namePattern?: 'numbered' | 'prefixed' | 'suffixed';
}

export type EquipmentType = 'access-points' | 'cameras' | 'elevators' | 'intercoms';

/**
 * Duplicate any equipment type with unified logic
 */
export const duplicateEquipment = async (
  equipmentType: EquipmentType,
  equipmentId: number,
  projectId: number,
  options: DuplicationOptions = {}
): Promise<boolean> => {
  const {
    quantity = 1,
    prefix = '',
    suffix = '',
    namePattern = 'numbered'
  } = options;

  try {
    const payload = {
      quantity,
      prefix,
      suffix,
      namePattern
    };

    const response = await apiRequest('POST', `/api/${equipmentType}/${equipmentId}/duplicate`, payload);
    
    if (!response.ok) {
      throw new Error(`Failed to duplicate ${equipmentType.slice(0, -1)}`);
    }

    const result = await response.json();
    
    toast({
      title: "Success!",
      description: `${equipmentType.slice(0, -1).replace('-', ' ')} duplicated successfully (${quantity} ${quantity === 1 ? 'copy' : 'copies'})`,
    });

    return true;
  } catch (error) {
    console.error(`Duplication error for ${equipmentType}:`, error);
    toast({
      title: "Duplication Failed",
      description: (error as Error).message,
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Batch duplicate multiple equipment items
 */
export const batchDuplicateEquipment = async (
  duplications: Array<{
    equipmentType: EquipmentType;
    equipmentId: number;
    projectId: number;
    options?: DuplicationOptions;
  }>
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const duplication of duplications) {
    const result = await duplicateEquipment(
      duplication.equipmentType,
      duplication.equipmentId,
      duplication.projectId,
      duplication.options
    );
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

/**
 * Generate name variations for duplicated equipment
 */
export const generateEquipmentNames = (
  baseName: string,
  quantity: number,
  options: DuplicationOptions = {}
): string[] => {
  const { prefix = '', suffix = '', namePattern = 'numbered' } = options;
  const names: string[] = [];

  for (let i = 1; i <= quantity; i++) {
    let name = baseName;
    
    switch (namePattern) {
      case 'prefixed':
        name = prefix ? `${prefix} ${baseName}` : `${baseName} ${i}`;
        break;
      case 'suffixed':
        name = suffix ? `${baseName} ${suffix}` : `${baseName} ${i}`;
        break;
      case 'numbered':
      default:
        name = `${baseName} ${i}`;
        if (prefix) name = `${prefix} ${name}`;
        if (suffix) name = `${name} ${suffix}`;
        break;
    }
    
    names.push(name);
  }

  return names;
};

/**
 * Preview equipment names before duplication
 */
export const previewDuplication = (
  baseName: string,
  options: DuplicationOptions = {}
): { names: string[]; summary: string } => {
  const { quantity = 1 } = options;
  const names = generateEquipmentNames(baseName, quantity, options);
  const summary = `Will create ${quantity} ${quantity === 1 ? 'copy' : 'copies'} of "${baseName}"`;
  
  return { names, summary };
};