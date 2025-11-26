# ThirdShift AI Features

## Overview

ThirdShift uses **AWS Bedrock with Claude 3** to provide intelligent, personalized meal planning that understands your family's unique needs.

## What AI Does for You

### 🧠 Intelligent Menu Generation
Instead of just matching recipes to filters, AI:
- Understands your family dynamics
- Creates personalized meal plans
- Adapts recipes for dietary restrictions
- Suggests creative ways to use expiring ingredients
- Balances nutrition, variety, and preferences

### 🎯 Smart Recipe Adaptation
AI automatically modifies recipes:
- Gluten-free substitutions
- Vegetarian/vegan alternatives
- Allergy-safe ingredients
- Portion adjustments
- Cooking time optimization

### 🍱 Creative School Lunches
AI generates age-appropriate, nutritious lunches:
- Portable and kid-friendly
- Nutritionally balanced
- Uses ingredients from your shopping list
- Variety to prevent boredom

### 📊 Pattern Learning
AI analyzes your consumption and provides insights:
- Items you consistently waste
- Items you run out of
- Seasonal trends
- Optimization recommendations

## Cost

**~$0.15 per week** (~$7.80/year) for AI-powered features

This is negligible compared to:
- Time saved: 5-10 hours/month of meal planning
- Food waste reduced: Estimated $50-100/month
- Better meal quality and variety

## Privacy

- All AI processing happens in **your AWS account**
- No data sent to third-party AI services
- Bedrock doesn't store or train on your data
- Your family data stays private

## Technical Details

- **Model**: Claude 3 Sonnet (Anthropic)
- **Region**: us-east-1 (Bedrock availability)
- **Fallback**: Recipe APIs if Bedrock unavailable
- **Response Time**: 2-5 seconds for meal plan generation

## Comparison

| Feature | Without AI | With AI |
|---------|-----------|---------|
| Personalization | ❌ Generic | ✅ Tailored to family |
| Recipe Adaptation | ❌ Manual | ✅ Automatic |
| Creativity | ❌ Limited | ✅ Intelligent suggestions |
| Context Understanding | ❌ None | ✅ Full family context |
| Cost | $0.05/week | $0.15/week |
| Quality | Good | Excellent |

## Example AI Interaction

**Input to AI**:
```
Family: 2 adults, 2 children (ages 8, 10)
Constraints:
- Mom: gluten-free, shellfish allergy
- Dad: vegetarian
- Kids: dislike mushrooms
- Expiring: 2L milk (2 days), 500g chicken (3 days)
- Budget: 800 NOK/week
- Monday: Mom cooking (beginner, 30 min)
```

**AI Output**:
```
Monday: Gluten-Free Chicken Quesadillas (uses expiring chicken)
- 30 minutes, beginner-friendly
- Gluten-free tortillas, chicken, cheese, vegetables
- Kid-friendly, uses expiring milk for cheese sauce
- Cost: 95 NOK

Tuesday: Vegetarian Pasta Primavera (Dad cooking)
- 45 minutes, intermediate
- Fresh vegetables, gluten-free pasta, parmesan
- No mushrooms, nutritionally balanced
- Cost: 110 NOK

[... continues for full week]
```

## Getting Started

1. **Enable Bedrock** in AWS Console (us-east-1)
2. **Request access** to Claude 3 models (instant approval)
3. **Deploy infrastructure** with `terraform apply`
4. **Start using** AI-powered meal planning!

See `ai-strategy.md` for detailed technical documentation.
