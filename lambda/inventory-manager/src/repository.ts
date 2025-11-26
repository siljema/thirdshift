import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { InventoryItem, WasteEvent } from './types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'thirdshift-dev-inventory';

export class InventoryRepository {
  async add(item: InventoryItem): Promise<InventoryItem> {
    await docClient.send(new PutCommand({
      TableName: INVENTORY_TABLE,
      Item: item
    }));
    
    return item;
  }

  async get(itemId: string): Promise<InventoryItem | null> {
    const result = await docClient.send(new GetCommand({
      TableName: INVENTORY_TABLE,
      Key: { itemId, expirationDate: await this.getExpirationDate(itemId) }
    }));

    return result.Item as InventoryItem || null;
  }

  async getByItemId(itemId: string): Promise<InventoryItem | null> {
    // Query by itemId (hash key)
    const result = await docClient.send(new QueryCommand({
      TableName: INVENTORY_TABLE,
      KeyConditionExpression: 'itemId = :itemId',
      ExpressionAttributeValues: {
        ':itemId': itemId
      },
      Limit: 1
    }));

    return result.Items?.[0] as InventoryItem || null;
  }

  async update(itemId: string, expirationDate: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;
      
      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = (updates as any)[key];
    });

    const result = await docClient.send(new UpdateCommand({
      TableName: INVENTORY_TABLE,
      Key: { itemId, expirationDate },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes as InventoryItem;
  }

  async delete(itemId: string, expirationDate: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: INVENTORY_TABLE,
      Key: { itemId, expirationDate }
    }));
  }

  async list(): Promise<InventoryItem[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: INVENTORY_TABLE
    }));
    
    return result.Items as InventoryItem[] || [];
  }

  async getExpiringItems(daysThreshold: number = 3): Promise<InventoryItem[]> {
    const today = new Date();
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    const thresholdDateStr = thresholdDate.toISOString().split('T')[0];

    // Scan and filter (GSI query doesn't support <= on hash key)
    const result = await docClient.send(new ScanCommand({
      TableName: INVENTORY_TABLE,
      FilterExpression: 'expirationDate <= :threshold',
      ExpressionAttributeValues: {
        ':threshold': thresholdDateStr
      }
    }));

    return result.Items as InventoryItem[] || [];
  }

  async getExpiredItems(): Promise<InventoryItem[]> {
    const today = new Date().toISOString().split('T')[0];

    // Scan and filter for expired items
    const result = await docClient.send(new ScanCommand({
      TableName: INVENTORY_TABLE,
      FilterExpression: 'expirationDate < :today',
      ExpressionAttributeValues: {
        ':today': today
      }
    }));

    return result.Items as InventoryItem[] || [];
  }

  async logWaste(wasteEvent: WasteEvent): Promise<void> {
    // In a real implementation, this would write to a separate waste tracking table
    // For now, we'll just log it
    console.log('Waste event logged:', JSON.stringify(wasteEvent));
  }

  private async getExpirationDate(itemId: string): Promise<string> {
    // Helper to get expiration date for an item
    const item = await this.getByItemId(itemId);
    return item?.expirationDate || '';
  }
}
