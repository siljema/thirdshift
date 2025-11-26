<div align="center">

![ThirdShift Logo](web-demo/big_logo.png)

# ThirdShift

### *Reclaim Your Time. Eliminate the Mental Load.*

**AI-Powered Household Food Management for Modern Families**

[🚀 Try the Demo](#quick-start) • [📖 Documentation](#documentation) • [💡 Features](#features) • [🏗️ Architecture](#architecture)

---

</div>

## The Problem: The "Third Shift"

After a full day of work (the first shift) and managing household responsibilities (the second shift), parents face a relentless **third shift**: the invisible mental burden of meal planning, grocery shopping, and food logistics.

Every day brings the same exhausting questions:
- *"What's for dinner tonight?"*
- *"Do we have ingredients for that?"*
- *"What should I pack for the kids' lunches?"*
- *"When did we buy that milk? Is it still good?"*
- *"We're over budget again this month..."*

**ThirdShift eliminates this burden entirely.**

---

## The Solution: Intelligent Automation

ThirdShift is an AI-powered system that handles **everything** about household food management:

✨ **Automatic Weekly Meal Planning** - AI generates personalized menus based on your family's preferences, dietary needs, and schedule

🗓️ **Calendar-Aware** - Adapts to your family's activities, school trips, and special events

🥗 **Smart Inventory Management** - Tracks what you have, prioritizes expiring items, reduces waste

🛒 **Autonomous Grocery Shopping** - Automatically orders and schedules delivery of exactly what you need

💰 **Budget-Conscious** - Stays within your spending limits while maintaining quality and variety

👨‍🍳 **Skill-Adaptive** - Matches recipe difficulty to who's cooking that night

🍱 **School Lunch Planning** - Generates nutritious, kid-friendly packed lunches daily

---

## Features

### 🤖 AI-Powered Intelligence

ThirdShift uses **AWS Bedrock with Claude 3** to understand your family's unique needs:

- **Personalized Meal Plans**: Not just random recipes - meals that your family will actually enjoy
- **Dietary Awareness**: Automatically respects allergies, restrictions, and preferences
- **Creative Solutions**: Suggests innovative ways to use ingredients before they expire
- **Adaptive Learning**: Gets better over time by learning your consumption patterns

### 📅 Calendar Integration

Seamlessly connects with your family calendar:

- **Automatic Adjustments**: Reduces portions when someone's away, increases for guests
- **Event-Aware**: Plans portable meals for field trips, simple dinners for busy nights
- **Cooking Assignments**: Matches recipe complexity to who's cooking (beginner, intermediate, advanced)

### 🥘 Inventory Management

Never waste food again:

- **Expiration Tracking**: Prioritizes ingredients approaching their expiration date
- **Real-Time Updates**: Knows what you have and what you need
- **Waste Reduction**: Uses what you already own before buying more
- **Cost Savings**: Reduces food waste by up to 40%

### 💳 Budget Control

Stay on track financially:

- **Budget Limits**: Set weekly or monthly spending caps
- **Cost-Conscious Planning**: AI selects affordable recipes within your budget
- **Spending Reports**: Track actual vs. planned spending
- **Smart Optimization**: Finds cheaper alternatives when needed

### 🛒 Autonomous Shopping

Grocery shopping without the hassle:

- **Automatic Orders**: Places orders with your preferred delivery service (Oda integration)
- **Optimized Quantities**: Orders based on actual consumption patterns, not guesses
- **Scheduled Delivery**: Arrives Monday morning, ready for the week
- **Payment Automation**: Securely processes payment through your bank

### 🍱 School Lunch Planning

Make mornings easier:

- **Daily Lunch Menus**: Age-appropriate, nutritious, kid-friendly options
- **Variety**: Different lunches every day, no boring repeats
- **Allergy-Safe**: Respects school policies and dietary restrictions
- **Prep Instructions**: Simple packing guides for busy mornings

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Sunday Evening: Weekly Planning Cycle Begins               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Calendar Analysis                                       │
│     • Who's home for each meal?                             │
│     • Any special events or activities?                     │
│     • Who's cooking each night?                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Inventory Check                                         │
│     • What food do we have?                                 │
│     • What's expiring soon?                                 │
│     • What needs to be used first?                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. AI Menu Generation                                      │
│     • 7 dinners + 10 school lunches                         │
│     • Respects all dietary restrictions                     │
│     • Uses expiring ingredients                             │
│     • Stays within budget                                   │
│     • Matches cooking skill levels                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Shopping List Creation                                  │
│     • Calculate net ingredients needed                      │
│     • Optimize quantities based on patterns                 │
│     • Estimate costs                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Autonomous Order Placement                              │
│     • Place order with Oda                                  │
│     • Schedule Monday morning delivery                      │
│     • Process payment                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Monday Morning: Groceries Arrive, Week Begins!            │
│     • Fresh ingredients delivered                           │
│     • Meal plan ready                                       │
│     • School lunches planned                                │
│     • You're free from the mental load                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Real-World Impact

### Time Saved
- **5-10 hours per week** previously spent on meal planning and shopping
- **No more daily "what's for dinner" stress**
- **Automated school lunch planning** saves 30 minutes every morning

### Money Saved
- **Reduce food waste by 40%** through smart inventory management
- **Stay within budget** with AI-powered cost optimization
- **Eliminate impulse purchases** with automated shopping

### Sustainability
- **Less food waste** = smaller environmental footprint
- **Optimized shopping** = fewer delivery trips
- **Smart consumption** = buy only what you need

### Mental Health
- **Eliminate decision fatigue** from daily meal planning
- **Reduce stress** around food logistics
- **More quality time** with family instead of planning and shopping

---

## Technology Stack

### AI & Machine Learning
- **AWS Bedrock** with Claude 3 Sonnet for intelligent meal planning
- **Pattern Learning** for consumption optimization
- **Natural Language Understanding** for recipe adaptation

### Cloud Infrastructure
- **AWS Lambda** for serverless compute
- **DynamoDB** for data storage
- **S3** for meal plan documents
- **EventBridge** for scheduling
- **API Gateway** for REST APIs

### Integrations
- **Calendar APIs** (Google Calendar, Microsoft Outlook)
- **Oda Grocery Delivery** for autonomous shopping
- **Bank/Payment APIs** for secure transactions
- **Recipe APIs** for meal inspiration

---

## Quick Start

### Try the Demo

```bash
# Clone the repository
git clone <repository-url>
cd thirdshift

# Start the web demo
cd web-demo
./start-server.sh

# Open http://localhost:8000 in your browser
```

### Deploy to AWS

```bash
# Set up infrastructure
cd infrastructure
terraform init
terraform apply

# Deploy Lambda functions
cd ../lambda/menu-generator
./deploy.sh

# Configure integrations
# See SETUP.md for detailed instructions
```

---

## Documentation

- **[Setup Guide](infrastructure/SETUP.md)** - Complete deployment instructions
- **[Requirements](/.kiro/specs/meal-planning-service/requirements.md)** - Detailed system requirements
- **[Design Document](/.kiro/specs/meal-planning-service/design.md)** - Architecture and design decisions
- **[AI Strategy](/.kiro/specs/meal-planning-service/ai-strategy.md)** - How we use AI effectively
- **[Testing Guide](TESTING-GUIDE.md)** - How to test the system
- **[Budget Integration](BUDGET-INTEGRATION-SUMMARY.md)** - Budget-aware meal planning

### Component Documentation
- [Menu Generator](lambda/menu-generator/README.md) - AI-powered meal planning
- [Budget Tracker](lambda/budget-tracker/README.md) - Spending management
- [Inventory Manager](lambda/inventory-manager/) - Food tracking
- [Calendar Analyzer](lambda/calendar-analyzer/) - Schedule integration
- [Profile Manager](lambda/profile-manager/) - Family profiles

---

## Architecture

ThirdShift is built on a serverless, event-driven architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                    (Web Demo / Mobile App)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Profile    │  │  Inventory  │  │  Calendar   │
│  Manager    │  │  Manager    │  │  Analyzer   │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Menu Generator                            │
│                  (AWS Bedrock + Claude 3)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Budget    │  │  Shopping   │  │ Consumption │
│   Tracker   │  │   Agent     │  │  Learning   │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage                              │
│         (DynamoDB Tables + S3 Buckets)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Pricing

### AI Costs
- **~$0.15 per week** per family for AI meal planning
- **~$7.20 per year** per family
- Significantly cheaper than the time saved (5-10 hours/week)

### AWS Infrastructure
- **Serverless pricing** - pay only for what you use
- **Estimated $5-10/month** for typical family usage
- Scales automatically with demand

### Total Cost of Ownership
- **~$130/year** for a family of four
- **ROI**: Saves 260-520 hours per year
- **Additional savings**: Reduced food waste, better budget control

---

## Roadmap

### Phase 1: Core Features ✅
- [x] AI-powered menu generation
- [x] Calendar integration
- [x] Inventory management
- [x] Budget tracking
- [x] Profile management

### Phase 2: Shopping Automation 🚧
- [ ] Oda integration
- [ ] Autonomous order placement
- [ ] Payment processing
- [ ] Delivery scheduling

### Phase 3: Learning & Optimization 📋
- [ ] Consumption pattern analysis
- [ ] Personalized recommendations
- [ ] Waste reduction insights
- [ ] Cost optimization suggestions

### Phase 4: Enhanced Experience 💡
- [ ] Mobile app
- [ ] Voice interface (Alexa/Google Home)
- [ ] Recipe photos and videos
- [ ] Social features (share meal plans)
- [ ] Multi-language support

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## License

[License information to be added]

---

## Support

- **Documentation**: See the [docs](/.kiro/specs/meal-planning-service/) folder
- **Issues**: Report bugs or request features via GitHub Issues
- **Questions**: Contact [support email]

---

<div align="center">

**ThirdShift** - *Because you deserve to enjoy dinner, not stress about it.*

Made with ❤️ for busy families everywhere

</div>
