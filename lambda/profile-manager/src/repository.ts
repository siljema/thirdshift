import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Profile, FamilyMemberProfile, GuestProfile, ProfileType } from './types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PROFILES_TABLE || 'thirdshift-dev-profiles';

export class ProfileRepository {
  async create(profile: Profile): Promise<Profile> {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: profile,
      ConditionExpression: 'attribute_not_exists(profileId)'
    }));
    
    return profile;
  }

  async get(profileId: string): Promise<Profile | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { profileId }
    }));

    return result.Item as Profile || null;
  }

  async update(profileId: string, updates: Partial<Profile>): Promise<Profile> {
    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;
      
      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = (updates as any)[key];
    });

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { profileId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes as Profile;
  }

  async delete(profileId: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { profileId }
    }));
  }

  async list(type?: ProfileType): Promise<Profile[]> {
    if (type) {
      // Query by type using GSI
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'type-index',
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':type': type
        }
      }));
      
      return result.Items as Profile[] || [];
    } else {
      // Scan all profiles
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME
      }));
      
      return result.Items as Profile[] || [];
    }
  }
}
