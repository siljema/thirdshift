import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { ProfileRepository } from './repository';
import { 
  FamilyMemberProfile, 
  GuestProfile, 
  CreateFamilyMemberInput, 
  CreateGuestInput,
  UpdateProfileInput 
} from './types';
import { 
  validateFamilyMemberInput, 
  validateGuestInput, 
  validateUpdateInput,
  ValidationError 
} from './validation';

const repository = new ProfileRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathParameters = event.pathParameters;

    // Route requests
    if (method === 'POST' && path === '/profiles') {
      return await createProfile(event);
    } else if (method === 'GET' && pathParameters?.id) {
      return await getProfile(pathParameters.id);
    } else if (method === 'GET' && path === '/profiles') {
      return await listProfiles(event);
    } else if (method === 'PUT' && pathParameters?.id) {
      return await updateProfile(pathParameters.id, event);
    } else if (method === 'DELETE' && pathParameters?.id) {
      return await deleteProfile(pathParameters.id);
    }

    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return handleError(error);
  }
};

async function createProfile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Request body is required' })
    };
  }

  const input = JSON.parse(event.body);
  const type = input.type;

  if (!type || (type !== 'family_member' && type !== 'guest')) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Type must be either "family_member" or "guest"' })
    };
  }

  const profileId = uuidv4();
  const now = new Date().toISOString();

  if (type === 'family_member') {
    validateFamilyMemberInput(input);
    
    const profile: FamilyMemberProfile = {
      profileId,
      type: 'family_member',
      name: input.name,
      age: input.age,
      role: input.role,
      dietaryRestrictions: input.dietaryRestrictions || [],
      allergies: input.allergies || [],
      dislikes: input.dislikes || [],
      preferences: input.preferences || [],
      cookingExpertiseLevel: input.cookingExpertiseLevel || 'beginner',
      calendarId: input.calendarId,
      createdAt: now,
      updatedAt: now
    };

    const created = await repository.create(profile);
    
    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify(created)
    };
  } else {
    validateGuestInput(input);
    
    const profile: GuestProfile = {
      profileId,
      type: 'guest',
      name: input.name,
      dietaryRestrictions: input.dietaryRestrictions || [],
      allergies: input.allergies || [],
      dislikes: input.dislikes || [],
      preferences: input.preferences || [],
      visitDates: input.visitDates || [],
      createdAt: now,
      updatedAt: now
    };

    const created = await repository.create(profile);
    
    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify(created)
    };
  }
}

async function getProfile(profileId: string): Promise<APIGatewayProxyResult> {
  const profile = await repository.get(profileId);

  if (!profile) {
    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Profile not found' })
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(profile)
  };
}

async function listProfiles(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const type = event.queryStringParameters?.type as 'family_member' | 'guest' | undefined;

  if (type && type !== 'family_member' && type !== 'guest') {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Type must be either "family_member" or "guest"' })
    };
  }

  const profiles = await repository.list(type);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ profiles, count: profiles.length })
  };
}

async function updateProfile(profileId: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Request body is required' })
    };
  }

  // Check if profile exists
  const existing = await repository.get(profileId);
  if (!existing) {
    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Profile not found' })
    };
  }

  const updates: UpdateProfileInput = JSON.parse(event.body);
  validateUpdateInput(updates);

  const updated = await repository.update(profileId, updates);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(updated)
  };
}

async function deleteProfile(profileId: string): Promise<APIGatewayProxyResult> {
  // Check if profile exists
  const existing = await repository.get(profileId);
  if (!existing) {
    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Profile not found' })
    };
  }

  await repository.delete(profileId);

  return {
    statusCode: 204,
    headers: corsHeaders(),
    body: ''
  };
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
}

function handleError(error: any): APIGatewayProxyResult {
  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }

  if (error.name === 'ConditionalCheckFailedException') {
    return {
      statusCode: 409,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Profile already exists' })
    };
  }

  return {
    statusCode: 500,
    headers: corsHeaders(),
    body: JSON.stringify({ error: 'Internal server error' })
  };
}
