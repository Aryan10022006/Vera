/**
 * Vera Protocol - Shared Utilities for Standalone AI Agents
 * Common utility functions used across all agents
 */

import { VERA_CONSTANTS, VeraError } from './types.js';

// Validation Utilities
export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateIPFSHash(hash: string): boolean {
  // IPFS v0 (Qm...) or v1 (bafy...) hash validation
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{55})$/.test(hash);
}

export function validateProjectId(projectId: string): boolean {
  return /^vera_[a-z0-9_]{10,50}$/.test(projectId);
}

// Vera Protocol Invariant Validators
export function validatePaymentSplit(technicalPercentage: number, subjectivePercentage: number): boolean {
  return technicalPercentage === VERA_CONSTANTS.TECHNICAL_PERCENTAGE && 
         subjectivePercentage === VERA_CONSTANTS.SUBJECTIVE_PERCENTAGE;
}

export function validateSilentConsentPeriod(hours: number): boolean {
  return hours === VERA_CONSTANTS.SILENT_CONSENT_HOURS;
}

export function validateTechnicalScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

// Time Utilities
export function getCurrentTimestamp(): number {
  return Date.now();
}

export function addHours(timestamp: number, hours: number): number {
  return timestamp + (hours * 60 * 60 * 1000);
}

export function isWithinTimeWindow(timestamp: number, windowHours: number): boolean {
  const now = getCurrentTimestamp();
  const windowEnd = addHours(timestamp, windowHours);
  return now <= windowEnd;
}

export function formatTimeRemaining(timestamp: number): string {
  const now = getCurrentTimestamp();
  const diff = timestamp - now;
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

// Crypto Utilities
export function generateProjectId(title: string, clientAddress: string): string {
  const titleHash = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const addressHash = clientAddress.substring(2, 8);
  const timestamp = Date.now().toString().slice(-6);
  
  return `vera_${titleHash}_${addressHash}_${timestamp}`;
}

export function generateMilestoneId(projectId: string, index: number): string {
  return `${projectId}_milestone_${index.toString().padStart(2, '0')}`;
}

export function generateDisputeId(projectId: string, milestoneId: string): string {
  const timestamp = Date.now().toString().slice(-8);
  return `dispute_${projectId}_${milestoneId}_${timestamp}`;
}

// Payment Calculation Utilities
export function calculateTechnicalAmount(totalAmount: bigint): bigint {
  return (totalAmount * BigInt(VERA_CONSTANTS.TECHNICAL_PERCENTAGE)) / BigInt(100);
}

export function calculateSubjectiveAmount(totalAmount: bigint): bigint {
  return (totalAmount * BigInt(VERA_CONSTANTS.SUBJECTIVE_PERCENTAGE)) / BigInt(100);
}

export function calculateProRataAmount(
  totalAmount: bigint,
  technicalCompletion: number,
  subjectiveCompletion: number
): {
  technicalAmount: bigint;
  subjectiveAmount: bigint;
  totalRelease: bigint;
} {
  const technicalPercentage = (technicalCompletion / 100) * VERA_CONSTANTS.TECHNICAL_PERCENTAGE;
  const subjectivePercentage = (subjectiveCompletion / 100) * VERA_CONSTANTS.SUBJECTIVE_PERCENTAGE;
  
  const technicalAmount = (totalAmount * BigInt(Math.floor(technicalPercentage))) / BigInt(100);
  const subjectiveAmount = (totalAmount * BigInt(Math.floor(subjectivePercentage))) / BigInt(100);
  
  return {
    technicalAmount,
    subjectiveAmount,
    totalRelease: technicalAmount + subjectiveAmount
  };
}

// String Utilities
export function sanitizeString(input: string, maxLength = 500): string {
  return input.trim().substring(0, maxLength);
}

export function extractKeywords(text: string, keywords: string[]): string[] {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword.toLowerCase()));
}

export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return totalWords > 0 ? commonWords.length / totalWords : 0;
}

// Array Utilities
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Retry Utilities
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Logging Utilities
export function createLogger(agentName: string) {
  const prefix = `[${agentName.toUpperCase()}]`;
  
  return {
    info: (message: string, data?: any) => {
      console.log(`${prefix} ℹ️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    success: (message: string, data?: any) => {
      console.log(`${prefix} ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    warning: (message: string, data?: any) => {
      console.warn(`${prefix} ⚠️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    error: (message: string, error?: any) => {
      console.error(`${prefix} ❌ ${message}`, error);
    },
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`${prefix} 🐛 ${message}`, data ? JSON.stringify(data, null, 2) : '');
      }
    }
  };
}

// Environment Utilities
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new VeraError(`Required environment variable ${name} is not set`, 'ENV_ERROR', 'verification');
  }
  return value;
}

export function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Network Utilities
export function getNetworkConfig(network: string) {
  const configs = {
    mainnet: {
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/',
      explorerUrl: 'https://etherscan.io'
    },
    sepolia: {
      chainId: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/',
      explorerUrl: 'https://sepolia.etherscan.io'
    },
    localhost: {
      chainId: 31337,
      rpcUrl: 'http://localhost:8545',
      explorerUrl: 'http://localhost:8545'
    }
  };
  
  return configs[network as keyof typeof configs] || configs.sepolia;
}

// Performance Utilities
export function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const executionTime = Date.now() - startTime;
      resolve({ result, executionTime });
    } catch (error) {
      reject(error);
    }
  });
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
}

// Data Structure Utilities
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mergeObjects<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

export function pickProperties<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}