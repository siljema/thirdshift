# ThirdShift AI Strategy

## Overview

ThirdShift leverages AWS Bedrock with Claude 3 models to provide intelligent, personalized meal planning that goes beyond simple recipe matching. The AI understands context, adapts to family preferences, and makes creative suggestions while respecting all constraints.

## Why AWS Bedrock?

1. **Fully Managed**: No infrastructure to manage, automatic scaling
2. **Cost-Effective**: Pay only for what you use, no upfront costs
3. **Privacy**: Data stays in your AWS account, not sent to third parties
4. **Claude 3 Models**: State-of-the-art reasoning and instruction following
5. **Low Latency**: Fast response times for real-time meal planning

## AI-Powered Features

### 1. Intelligent Menu Generation

**Traditional Approach** (Recipe APIs):
- Search for recipes matching filters
- Limited understanding of context
- Generic results
- No adaptation for specific needs

**AI-Powered Approach** (Bedrock):
- Understands family dynamics and preferences
- Creates personalized meal plans considering all constraints
- Adapts recipes on-the-fly for dietary restrictions
- Suggests creative ways to use expiring ingredients
- Balances nutrition, variety, and family preferences

**Example Prompt**:
```
You are a family meal planner. Create a weekly dinner menu for a family of 4 (2 adults, 2 children ages 8 and 10).

Constraints:
- Mom is gluten-free and allergic to shellfish
- Dad is vegetarian
- Kids dislike mushrooms and olives
- Must use: 2 liters of milk (expires in 2 days), 500g chicken breast (expires in 3 days)
- Budget: 800 NOK for the week
- Monday: Mom cooking (beginner level, 30 min max)
- Tuesday: Dad cooking (intermediate level)
- Wednesday: Takeout night
- Thursday: Kids help cooking (simple recipes)
- Friday: Dad cooking (advanced level, can take time)

Generate 5 dinner recipes (skip Wednesday) with:
- Recipe name
- Ingredients with quantities
- Cooking time and difficulty
- Instructions
- Nutritional info
- Cost estimate

Format as JSON.
```

### 2. Recipe Adaptation

AI can automatically adapt recipes for dietary restrictions:

**Example**:
- Original recipe uses wheat pasta → AI suggests gluten-free pasta or zucchini noodles
- Recipe has shellfish → AI substitutes with chicken or tofu
- Too spicy for kids → AI adjusts spice levels

### 3. School Lunch Creativity

AI generates age-appropriate, nutritious, and appealing school lunches:

**Example Prompt**:
```
Create 5 school lunch ideas for:
- 8-year-old child
- Must be portable and eaten cold or room temperature
- Nut-free (school policy)
- Nutritious and appealing to children
- Uses ingredients from this week's shopping list

Include variety: sandwiches, wraps, pasta salads, etc.
```

### 4. Smart Ingredient Substitutions

When ingredients are unavailable or too expensive, AI suggests alternatives:

**Example**:
- Expensive: Saffron → Turmeric for color
- Out of stock: Fresh basil → Dried basil or parsley
- Dietary: Butter → Olive oil or vegan butter

### 5. Consumption Pattern Analysis

AI can analyze consumption history and provide insights:

**Example Prompt**:
```
Analyze this family's consumption patterns over 12 weeks:
[consumption data]

Identify:
1. Items consistently wasted (suggest reducing quantities)
2. Items running out mid-week (suggest increasing quantities)
3. Seasonal trends
4. Recommendations for optimization
```

## Model Selection

### Primary Model: Claude 3 Sonnet
- **Use Case**: Menu generation, recipe adaptation
- **Strengths**: Excellent reasoning, follows complex instructions, good at structured output
- **Cost**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Typical Usage**: ~5,000 tokens per meal plan = $0.09 per week

### Fallback Model: Claude 3 Haiku
- **Use Case**: Simple tasks, cost optimization
- **Strengths**: Fast, cheap, good for straightforward tasks
- **Cost**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Typical Usage**: ~2,000 tokens per task = $0.003 per week

## Cost Analysis

### Weekly AI Costs (per family)

**Menu Generation** (1x per week):
- Input: ~3,000 tokens (constraints, preferences, inventory)
- Output: ~2,000 tokens (7 meal plans with recipes)
- Cost: ~$0.09

**Recipe Adaptations** (~3x per week):
- Input: ~500 tokens per adaptation
- Output: ~300 tokens per adaptation
- Cost: ~$0.01 per adaptation = $0.03/week

**School Lunch Generation** (1x per week):
- Input: ~1,000 tokens
- Output: ~1,500 tokens
- Cost: ~$0.03

**Total Weekly AI Cost**: ~$0.15 per family
**Monthly AI Cost**: ~$0.60 per family
**Annual AI Cost**: ~$7.20 per family

This is significantly cheaper than the time saved (estimated 5-10 hours per month of meal planning).

## Implementation Strategy

### Phase 1: Menu Generator (Current)
- Integrate Bedrock into Menu Generator Lambda
- Use Claude 3 Sonnet for meal plan generation
- Fallback to recipe APIs if Bedrock fails
- Structured JSON output for consistency

### Phase 2: Recipe Adaptation
- Real-time recipe modifications based on dietary needs
- Ingredient substitution suggestions
- Portion adjustments

### Phase 3: Learning and Optimization
- Analyze consumption patterns with AI
- Provide personalized recommendations
- Predict family preferences

### Phase 4: Natural Language Interface
- Allow users to request changes via natural language
- "Make Monday's dinner vegetarian"
- "Swap chicken for fish this week"
- "Add more Italian recipes"

## Prompt Engineering Best Practices

### 1. Structured Output
Always request JSON format for easy parsing:

```json
{
  "meals": [
    {
      "day": "Monday",
      "mealType": "dinner",
      "recipeName": "Gluten-Free Chicken Pasta",
      "ingredients": [...],
      "instructions": [...],
      "cookingTime": 30,
      "difficulty": "beginner",
      "cost": 120
    }
  ]
}
```

### 2. Clear Constraints
Be explicit about hard vs. soft constraints:

**Hard Constraints** (must follow):
- Allergies
- Dietary restrictions
- Budget limits
- Cooking time limits

**Soft Constraints** (prefer but flexible):
- Preferences
- Variety
- Nutritional goals

### 3. Context Window Management
Claude 3 Sonnet has 200K token context window, but keep prompts focused:
- Include only relevant data
- Summarize historical patterns
- Use structured data formats

### 4. Error Handling
Always validate AI output:
- Check JSON structure
- Verify all required fields present
- Validate ingredient quantities
- Ensure recipes meet constraints
- Fallback to recipe APIs if validation fails

## Privacy and Security

### Data Handling
- All AI processing happens in your AWS account
- No data sent to third-party AI services
- Bedrock doesn't store or train on your data
- Family data stays in your DynamoDB tables

### PII Protection
- Don't include unnecessary personal information in prompts
- Use generic identifiers (Mom, Dad, Child1, Child2)
- Sanitize data before sending to Bedrock

## Monitoring and Optimization

### Metrics to Track
1. **AI Usage**:
   - Tokens consumed per request
   - Cost per meal plan
   - Response times

2. **Quality Metrics**:
   - Recipe acceptance rate
   - User modifications to AI suggestions
   - Fallback to recipe APIs frequency

3. **Performance**:
   - Lambda execution time
   - Bedrock API latency
   - Error rates

### Cost Optimization
1. Use Claude 3 Haiku for simple tasks
2. Cache common prompts and responses
3. Batch requests when possible
4. Implement request throttling
5. Monitor and alert on unusual usage

## Future Enhancements

1. **Multi-Modal AI**: Use image recognition for fridge inventory
2. **Voice Interface**: Alexa/Google Home integration
3. **Personalization**: Fine-tune models on family preferences
4. **Predictive Planning**: Anticipate needs based on calendar patterns
5. **Social Features**: Share AI-generated meal plans with friends

## Comparison: With vs Without AI

### Without AI (Recipe APIs Only)
- ❌ Generic recipes that may not fit family needs
- ❌ Manual adaptation for dietary restrictions
- ❌ Limited creativity with expiring ingredients
- ❌ No understanding of family dynamics
- ❌ Rigid recipe matching
- ✅ Lower cost (~$0.05/week for API calls)
- ✅ Faster response times

### With AI (Bedrock)
- ✅ Personalized meal plans
- ✅ Automatic recipe adaptation
- ✅ Creative use of available ingredients
- ✅ Understands family context
- ✅ Flexible and intelligent
- ✅ Natural language understanding
- ❌ Higher cost (~$0.15/week)
- ❌ Slightly slower (2-5 seconds)

**Recommendation**: Use AI for the best user experience. The additional $0.10/week ($5/year) is negligible compared to the value provided.

## Getting Started

### 1. Enable Bedrock in AWS Console
```bash
# Bedrock is available in us-east-1, us-west-2, and other regions
# Enable Claude 3 models in your AWS account
```

### 2. Request Model Access
- Go to AWS Bedrock console
- Request access to Anthropic Claude 3 models
- Approval is usually instant

### 3. Test Bedrock Access
```bash
aws bedrock invoke-model \
  --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
  --body '{"prompt":"Hello, Claude!","max_tokens":100}' \
  --region us-east-1 \
  output.json
```

### 4. Deploy Infrastructure
The Terraform configuration already includes Bedrock permissions. Just deploy:

```bash
cd infrastructure/environments/dev
terraform apply
```

## Conclusion

AWS Bedrock transforms ThirdShift from a simple meal planning tool into an intelligent family assistant. The AI understands context, adapts to needs, and provides personalized recommendations that would be impossible with traditional recipe APIs.

The cost is minimal (~$7/year per family) compared to the time saved and improved meal quality. This is a key differentiator that makes ThirdShift truly solve the "third shift" problem.
