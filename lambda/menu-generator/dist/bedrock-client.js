"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockClient = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const BEDROCK_REGION = process.env.BEDROCK_REGION || 'us-east-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: BEDROCK_REGION });
class BedrockClient {
    async generateMealPlan(prompt) {
        try {
            const payload = {
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            };
            const command = new client_bedrock_runtime_1.InvokeModelCommand({
                modelId: MODEL_ID,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify(payload)
            });
            const response = await client.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            // Extract text from Claude's response
            const text = responseBody.content[0].text;
            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse JSON from AI response');
        }
        catch (error) {
            console.error('Bedrock error:', error);
            throw error;
        }
    }
    buildMealPlanPrompt(input) {
        const { profiles, inventory, availability, budget, expiringItems } = input;
        // Build dietary restrictions summary
        const restrictions = profiles
            .flatMap(p => p.dietaryRestrictions || [])
            .filter((v, i, a) => a.indexOf(v) === i);
        const allergies = profiles
            .flatMap(p => p.allergies || [])
            .filter((v, i, a) => a.indexOf(v) === i);
        // Count children for school lunches
        const children = profiles.filter(p => p.role === 'child');
        const schoolLunchesNeeded = children.length * 5; // 5 school days per week
        // Build availability info
        const availabilityInfo = this.buildAvailabilitySection(availability, profiles);
        // Build inventory info
        const inventoryInfo = this.buildInventorySection(inventory, expiringItems);
        const prompt = `You are a family meal planner AI. Create a complete weekly meal plan for a family.

FAMILY PROFILE:
${profiles.map(p => `- ${p.name}: ${p.role}, age ${p.age || 'N/A'}${p.cookingExpertiseLevel ? `, cooking: ${p.cookingExpertiseLevel}` : ''}`).join('\n')}

DIETARY CONSTRAINTS (MUST FOLLOW):
${restrictions.length > 0 ? `- Dietary Restrictions: ${restrictions.join(', ')}` : '- No dietary restrictions'}
${allergies.length > 0 ? `- Allergies (CRITICAL): ${allergies.join(', ')}` : '- No allergies'}

${inventoryInfo}

${availabilityInfo}

BUDGET CONSTRAINT: ${budget ? `${budget} NOK available for this week's groceries` : 'No budget limit'}
${budget ? `⚠️ IMPORTANT: Keep total estimated cost under ${budget} NOK. Choose cost-effective recipes and ingredients.` : ''}

REQUIREMENTS:
1. Generate 7 dinner recipes (Monday-Sunday)
2. Generate ${schoolLunchesNeeded} school lunch recipes (portable, child-friendly)
3. MUST avoid all allergies (especially for children)
4. MUST respect dietary restrictions
5. USE INVENTORY WISELY:
   - Prioritize expiring ingredients (marked with ⚠️) in the next 1-2 days
   - Use available inventory items before suggesting new purchases
   - Only suggest buying items not in inventory or running low
6. MATCH COOKING TO SCHEDULE:
   - Match recipe difficulty to the assigned cook's expertise level
   - Adjust portion sizes based on who's present (see schedule)
   - If someone is absent, reduce portions or skip their dietary preferences
7. STAY WITHIN BUDGET:
   - Choose cost-effective ingredients and recipes
   - Use affordable proteins (chicken, eggs, beans) more than expensive ones (beef, seafood)
   - Prioritize seasonal and common ingredients
   - Estimate realistic costs for each meal
   - Total cost for all meals should be under the budget constraint
8. Ensure variety (different cuisines, proteins, cooking methods)
9. School lunches must be:
   - Portable and easy to pack
   - Age-appropriate for children (ages ${children.map(c => c.age).join(', ')})
   - Nutritious and balanced
   - No items requiring refrigeration if not available
   - Fun and appealing to kids
10. SMART PLANNING:
   - If fewer people for dinner, suggest simpler/smaller meals
   - If beginner cooking, keep it simple (<30 min, <10 steps)
   - If advanced cook, can do complex recipes
   - Use what's in the fridge before it expires!

OUTPUT FORMAT (JSON only, no other text):
{
  "dinners": [
    {
      "day": "Monday",
      "recipeName": "Recipe Name",
      "cookingTime": 30,
      "difficulty": "beginner",
      "servings": 4,
      "ingredients": [
        {"name": "ingredient", "quantity": 2, "unit": "cups"}
      ],
      "instructions": ["Step 1", "Step 2"],
      "usesExpiringIngredients": ["Milk"],
      "estimatedCost": 120
    }
  ],
  "schoolLunches": [
    {
      "day": "Monday",
      "childName": "${children[0]?.name || 'Child'}",
      "recipeName": "Lunch Name",
      "prepTime": 10,
      "items": [
        {"name": "sandwich", "quantity": 1, "unit": "piece"},
        {"name": "apple", "quantity": 1, "unit": "piece"}
      ],
      "packingInstructions": ["Pack in lunchbox", "Include ice pack"],
      "estimatedCost": 40
    }
  ]
}

Generate the complete meal plan now.`;
        return prompt;
    }
    buildInventorySection(inventory, expiringItems) {
        let section = 'CURRENT INVENTORY:\n';
        if (inventory.length === 0) {
            section += '- No inventory data available\n';
        }
        else {
            // Group by category
            const byCategory = inventory.reduce((acc, item) => {
                const cat = item.category || 'other';
                if (!acc[cat])
                    acc[cat] = [];
                acc[cat].push(item);
                return acc;
            }, {});
            Object.entries(byCategory).forEach(([category, items]) => {
                section += `\n${category.toUpperCase()}:\n`;
                items.forEach((item) => {
                    const isExpiring = expiringItems.some(exp => exp.itemId === item.itemId);
                    const expiryNote = isExpiring ? ` ⚠️ EXPIRES ${item.expirationDate}` : '';
                    section += `  - ${item.name}: ${item.quantity} ${item.unit}${expiryNote}\n`;
                });
            });
        }
        if (expiringItems.length > 0) {
            section += '\n⚠️ PRIORITY: These items are expiring soon - USE FIRST:\n';
            expiringItems.forEach(item => {
                section += `  - ${item.name} (${item.quantity} ${item.unit}) - expires ${item.expirationDate}\n`;
            });
        }
        return section;
    }
    buildAvailabilitySection(availability, profiles) {
        if (!availability || Object.keys(availability).length === 0) {
            return 'WEEKLY SCHEDULE:\n- No calendar data available, assume all family members present for all meals\n';
        }
        let section = 'WEEKLY SCHEDULE (who is home and who is cooking):\n';
        const dates = Object.keys(availability).sort();
        dates.forEach(date => {
            const dayData = availability[date];
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            section += `\n${dayName}:\n`;
            // Dinner is most important
            if (dayData.dinner) {
                const cook = dayData.dinner.cook || 'unknown';
                const cookProfile = profiles.find(p => p.name === cook);
                const expertise = cookProfile?.cookingExpertiseLevel || 'beginner';
                const present = dayData.dinner.present || [];
                section += `  DINNER: ${present.length} people present (${present.join(', ')})\n`;
                section += `    Cook: ${cook} (${expertise} level)\n`;
                if (present.length < profiles.length) {
                    const absent = profiles.filter(p => !present.includes(p.name)).map(p => p.name);
                    section += `    Absent: ${absent.join(', ')}\n`;
                }
            }
            // Note breakfast/lunch if different
            if (dayData.breakfast && dayData.breakfast.present) {
                const present = dayData.breakfast.present;
                if (present.length < profiles.length) {
                    section += `  Breakfast: Only ${present.length} people (${present.join(', ')})\n`;
                }
            }
            if (dayData.lunch && dayData.lunch.present) {
                const present = dayData.lunch.present;
                if (present.length < profiles.length) {
                    section += `  Lunch: Only ${present.length} people (${present.join(', ')})\n`;
                }
            }
        });
        return section;
    }
}
exports.BedrockClient = BedrockClient;
