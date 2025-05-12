// Custom schemas for validation
import { z } from 'zod';
import { insertKvgStreamSchema } from '../shared/schema';

// Create a more flexible schema for KVG streams that allows additional fields
export const flexibleKvgStreamSchema = insertKvgStreamSchema.passthrough();