import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { FridgeDeviceData } from './types';

const secretsClient = new SecretsManagerClient({});

export class FridgeAdapter {
  private apiKey?: string;
  private deviceId?: string;

  async initialize(): Promise<void> {
    // Load credentials from Secrets Manager
    const secretName = process.env.FRIDGE_SECRET || 'thirdshift-dev-fridge-credentials';
    
    try {
      const response = await secretsClient.send(new GetSecretValueCommand({
        SecretId: secretName
      }));

      if (response.SecretString) {
        const credentials = JSON.parse(response.SecretString);
        this.apiKey = credentials.api_key;
        this.deviceId = credentials.device_id;
      }
    } catch (error) {
      console.warn('Could not load fridge credentials:', error);
      // Continue without fridge integration
    }
  }

  async syncInventory(): Promise<FridgeDeviceData | null> {
    if (!this.apiKey || !this.deviceId) {
      console.log('Fridge integration not configured, skipping sync');
      return null;
    }

    try {
      // In a real implementation, this would call the actual fridge device API
      // For now, return mock data
      console.log('Syncing with fridge device:', this.deviceId);
      
      // Mock implementation - replace with actual API call
      return this.getMockFridgeData();
    } catch (error) {
      console.error('Error syncing with fridge device:', error);
      throw new Error('Failed to sync with fridge device');
    }
  }

  private getMockFridgeData(): FridgeDeviceData {
    // Mock data for testing
    return {
      deviceId: this.deviceId || 'mock-device',
      items: [
        {
          barcode: '123456789',
          name: 'Milk',
          quantity: 2,
          unit: 'liters',
          addedDate: new Date().toISOString()
        },
        {
          name: 'Eggs',
          quantity: 12,
          unit: 'pieces',
          addedDate: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  async reportConsumption(itemId: string, quantity: number): Promise<void> {
    if (!this.apiKey || !this.deviceId) {
      return;
    }

    try {
      // In a real implementation, notify the fridge device about consumption
      console.log(`Reporting consumption to fridge: ${itemId}, quantity: ${quantity}`);
    } catch (error) {
      console.error('Error reporting consumption to fridge:', error);
      // Don't throw - this is not critical
    }
  }
}
