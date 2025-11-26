// ThirdShift Demo App

// AWS Lambda function names
const LAMBDA_FUNCTIONS = {
    profileManager: 'thirdshift-dev-profile-manager',
    inventoryManager: 'thirdshift-dev-inventory-manager',
    calendarAnalyzer: 'thirdshift-dev-calendar-analyzer'
};

const AWS_REGION = 'us-west-2';

// Test Profile Manager
async function testProfileManager() {
    const resultDiv = document.getElementById('profile-result');
    const button = event.target;
    
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Testing...';
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.textContent = 'Creating test profile...';

    try {
        const apiUrl = document.getElementById('apiUrl').value;
        if (!apiUrl) {
            throw new Error('Please enter API Gateway URL in configuration');
        }

        // Create a test profile
        const testProfile = {
            type: 'family_member',
            name: 'Demo User',
            age: 35,
            role: 'adult',
            dietaryRestrictions: ['gluten-free'],
            allergies: ['peanuts'],
            dislikes: ['mushrooms'],
            preferences: ['italian', 'mexican'],
            cookingExpertiseLevel: 'intermediate'
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testProfile)
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.className = 'result success';
            resultDiv.textContent = '✓ Success!\n\n' + JSON.stringify(data, null, 2);
        } else {
            throw new Error(JSON.stringify(data));
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '✗ Error:\n\n' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Test Profile Manager';
    }
}

// Test Inventory Manager
async function testInventoryManager() {
    const resultDiv = document.getElementById('inventory-result');
    const button = event.target;
    
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Testing...';
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.textContent = 'Testing inventory operations...';

    try {
        // Note: Inventory Manager uses direct Lambda invocation, not API Gateway
        // For demo purposes, we'll show what the response would look like
        
        const mockResponse = {
            statusCode: 201,
            body: {
                itemId: 'demo-' + Date.now(),
                name: 'Milk',
                category: 'dairy',
                quantity: 2,
                unit: 'liters',
                expirationDate: '2025-12-10',
                location: 'fridge',
                cost: 45,
                addedDate: new Date().toISOString()
            }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        resultDiv.className = 'result success';
        resultDiv.textContent = '✓ Success! (Mock Response)\n\n' + 
            'To test for real, use AWS CLI:\n' +
            'aws lambda invoke \\\n' +
            '  --function-name thirdshift-dev-inventory-manager \\\n' +
            '  --payload \'{"action":"add","data":{"name":"Milk","category":"dairy","quantity":2,"unit":"liters","expirationDate":"2025-12-10","location":"fridge","cost":45}}\' \\\n' +
            '  --region us-west-2 response.json\n\n' +
            'Mock Response:\n' + JSON.stringify(mockResponse, null, 2);
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '✗ Error:\n\n' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Test Inventory Manager';
    }
}

// Test Calendar Analyzer
async function testCalendarAnalyzer() {
    const resultDiv = document.getElementById('calendar-result');
    const button = event.target;
    
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Testing...';
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.textContent = 'Analyzing calendar...';

    try {
        // Mock response showing calendar analysis
        const mockResponse = {
            statusCode: 200,
            body: {
                message: 'Calendar analysis complete',
                availabilityMatrix: {
                    weekStartDate: '2025-12-02',
                    weekEndDate: '2025-12-08',
                    meals: [
                        {
                            date: '2025-12-02',
                            mealType: 'dinner',
                            adultsPresent: 2,
                            childrenPresent: 2,
                            totalPeople: 4,
                            presentProfiles: ['Mom', 'Dad', 'Child1', 'Child2'],
                            cookingPerson: 'Mom',
                            cookingExpertise: 'intermediate'
                        },
                        {
                            date: '2025-12-03',
                            mealType: 'dinner',
                            adultsPresent: 2,
                            childrenPresent: 2,
                            totalPeople: 4,
                            presentProfiles: ['Mom', 'Dad', 'Child1', 'Child2'],
                            cookingPerson: 'Dad',
                            cookingExpertise: 'beginner'
                        }
                    ],
                    specialEvents: [
                        {
                            date: '2025-12-04',
                            eventType: 'school-trip',
                            affectedPeople: ['Child1'],
                            mealImpact: {
                                mealType: 'lunch',
                                requiresPackedLunch: true
                            },
                            notes: 'School Field Trip'
                        }
                    ],
                    summary: {
                        totalMeals: 21,
                        mealsWithFullFamily: 14,
                        mealsWithGuests: 0,
                        packedLunchesNeeded: 1
                    }
                },
                eventsAnalyzed: 42
            }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        resultDiv.className = 'result success';
        resultDiv.textContent = '✓ Success! (Mock Response)\n\n' +
            'Week Analysis:\n' +
            '• Total Meals: 21\n' +
            '• Full Family Meals: 14\n' +
            '• Packed Lunches Needed: 1\n' +
            '• Events Analyzed: 42\n\n' +
            'Sample Meals:\n' +
            '• Monday Dinner: 4 people, Mom cooking (intermediate)\n' +
            '• Tuesday Dinner: 4 people, Dad cooking (beginner)\n\n' +
            'Special Events:\n' +
            '• Wednesday: School trip (packed lunch needed)\n\n' +
            'To test for real, use AWS CLI:\n' +
            'aws lambda invoke \\\n' +
            '  --function-name thirdshift-dev-calendar-analyzer \\\n' +
            '  --payload \'{"action":"analyze-week"}\' \\\n' +
            '  --region us-west-2 response.json\n\n' +
            'Full Response:\n' + JSON.stringify(mockResponse, null, 2);
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '✗ Error:\n\n' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Test Calendar Analyzer';
    }
}

// Test Menu Generator
async function testMenuGenerator() {
    const resultDiv = document.getElementById('menu-result');
    const button = event.target;
    
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Generating Menu...';
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.textContent = 'Generating AI-powered meal plan...';

    try {
        // Mock response with realistic meal plan data
        const mockResponse = {
            statusCode: 200,
            body: {
                success: true,
                mealPlan: {
                    mealPlanId: 'plan-' + Date.now(),
                    weekStartDate: '2025-12-02',
                    weekEndDate: '2025-12-08',
                    meals: [
                        // Monday - Child 1 away (only 3 people)
                        { date: '2025-12-02', mealType: 'dinner', recipeName: 'Gluten-Free Chicken Stir-Fry (3 servings)', servings: 3, cookingTime: 25, difficulty: 'intermediate', cost: 90 },
                        { date: '2025-12-02', mealType: 'school_lunch', recipeName: 'Turkey Sandwich with Veggies (Child 1)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 40 },
                        { date: '2025-12-02', mealType: 'school_lunch', recipeName: 'Turkey Sandwich with Veggies (Child 2)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 40 },
                        // Tuesday
                        { date: '2025-12-03', mealType: 'dinner', recipeName: 'Easy Beef Tacos', servings: 4, cookingTime: 20, difficulty: 'beginner', cost: 110 },
                        { date: '2025-12-03', mealType: 'school_lunch', recipeName: 'Pasta Salad with Chicken (Child 1)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 45 },
                        { date: '2025-12-03', mealType: 'school_lunch', recipeName: 'Pasta Salad with Chicken (Child 2)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 45 },
                        // Wednesday - Extra guest (5 people, vegetarian option)
                        { date: '2025-12-04', mealType: 'dinner', recipeName: 'Mediterranean Vegetable Pasta (Guest-Friendly)', servings: 5, cookingTime: 30, difficulty: 'intermediate', cost: 130 },
                        { date: '2025-12-04', mealType: 'school_lunch', recipeName: 'Wraps with Ham and Cheese (Child 1)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 38 },
                        { date: '2025-12-04', mealType: 'school_lunch', recipeName: 'Wraps with Ham and Cheese (Child 2)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 38 },
                        // Thursday
                        { date: '2025-12-05', mealType: 'dinner', recipeName: 'Vegetable Curry with Rice', servings: 4, cookingTime: 40, difficulty: 'intermediate', cost: 95 },
                        { date: '2025-12-05', mealType: 'school_lunch', recipeName: 'Crackers with Cheese and Fruit (Child 1)', servings: 1, cookingTime: 5, difficulty: 'beginner', cost: 35 },
                        { date: '2025-12-05', mealType: 'school_lunch', recipeName: 'Crackers with Cheese and Fruit (Child 2)', servings: 1, cookingTime: 5, difficulty: 'beginner', cost: 35 },
                        // Friday - Child 1 on field trip (only 1 school lunch needed)
                        { date: '2025-12-06', mealType: 'dinner', recipeName: 'Homemade Pizza Night', servings: 4, cookingTime: 45, difficulty: 'intermediate', cost: 85 },
                        { date: '2025-12-06', mealType: 'school_lunch', recipeName: 'Mini Pizzas (Child 2 only - Child 1 on field trip)', servings: 1, cookingTime: 10, difficulty: 'beginner', cost: 42 },
                        // Saturday
                        { date: '2025-12-07', mealType: 'dinner', recipeName: 'BBQ Ribs with Coleslaw', servings: 4, cookingTime: 90, difficulty: 'advanced', cost: 180 },
                        // Sunday
                        { date: '2025-12-08', mealType: 'dinner', recipeName: 'Roast Chicken with Potatoes', servings: 4, cookingTime: 75, difficulty: 'advanced', cost: 140 }
                    ],
                    inventoryUsage: [
                        { name: 'Milk', quantityUsed: 2, unit: 'liters', category: 'dairy', fromInventory: 2, expirationDate: '2025-12-04', isExpiring: true },
                        { name: 'Eggs', quantityUsed: 8, unit: 'pieces', category: 'dairy', fromInventory: 12, expirationDate: '2025-12-10', isExpiring: false },
                        { name: 'Chicken Breast', quantityUsed: 1, unit: 'kg', category: 'meat', fromInventory: 1, expirationDate: '2025-12-03', isExpiring: true }
                    ],
                    shoppingList: [
                        { name: 'Chicken Breast', quantity: 1, unit: 'kg', category: 'meat', estimatedCost: 90 },
                        { name: 'Salmon Fillets', quantity: 800, unit: 'g', category: 'fish', estimatedCost: 150 },
                        { name: 'Ground Beef', quantity: 500, unit: 'g', category: 'meat', estimatedCost: 85 },
                        { name: 'Gluten-Free Flour', quantity: 1, unit: 'kg', category: 'grains', estimatedCost: 65 },
                        { name: 'Rice', quantity: 1, unit: 'kg', category: 'grains', estimatedCost: 35 },
                        { name: 'Mixed Vegetables', quantity: 2, unit: 'kg', category: 'produce', estimatedCost: 70 },
                        { name: 'Tomatoes', quantity: 1, unit: 'kg', category: 'produce', estimatedCost: 45 },
                        { name: 'Lettuce', quantity: 2, unit: 'heads', category: 'produce', estimatedCost: 40 },
                        { name: 'Cheese', quantity: 500, unit: 'g', category: 'dairy', estimatedCost: 75 },
                        { name: 'Bread', quantity: 2, unit: 'loaves', category: 'bakery', estimatedCost: 50 }
                    ],
                    totalCost: 1180,
                    status: 'draft',
                    createdAt: new Date().toISOString()
                }
            }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mealPlan = mockResponse.body.mealPlan;

        // Mock budget data
        const mockBudget = {
            budgetLimit: 1200,
            spent: 350, // Previous spending
            remaining: 850
        };

        resultDiv.className = 'result success';
        resultDiv.textContent = '✓ Success!\n\n' +
            `Generated ${mealPlan.meals.length} meals for the week\n` +
            `Total Cost: ${mealPlan.totalCost} NOK\n` +
            `Shopping Items: ${mealPlan.shoppingList.length}\n\n` +
            'Scroll down to see the full calendar view!';

        // Render the meal plan calendar with budget info
        renderMealPlanCalendar(mealPlan, mockBudget);

    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '✗ Error:\n\n' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Generate Weekly Menu';
    }
}

// Render meal plan in calendar view
function renderMealPlanCalendar(mealPlan, budget) {
    const container = document.getElementById('meal-plan-calendar');
    const calendarGrid = document.getElementById('calendar-grid');
    const shoppingItems = document.getElementById('shopping-items');
    const budgetStatus = document.getElementById('budget-status');
    
    // Update header info
    document.getElementById('week-range').textContent = 
        `${formatDate(mealPlan.weekStartDate)} - ${formatDate(mealPlan.weekEndDate)}`;
    document.getElementById('total-meals').textContent = mealPlan.meals.length;
    document.getElementById('total-cost').textContent = mealPlan.totalCost;

    // Render budget status
    if (budget) {
        const newTotal = budget.spent + mealPlan.totalCost;
        const percentageUsed = (newTotal / budget.budgetLimit * 100);
        const isWithinBudget = newTotal <= budget.budgetLimit;
        const isWarning = percentageUsed >= 80 && percentageUsed < 100;
        const isOverBudget = percentageUsed >= 100;

        let statusClass = 'within-budget';
        let barClass = 'good';
        let statusIcon = '✓';
        let statusText = 'Within Budget';

        if (isOverBudget) {
            statusClass = 'over-budget';
            barClass = 'danger';
            statusIcon = '⚠️';
            statusText = 'Over Budget';
        } else if (isWarning) {
            statusClass = 'warning';
            barClass = 'warning';
            statusIcon = '⚠️';
            statusText = 'Approaching Limit';
        }

        budgetStatus.className = `budget-status ${statusClass}`;
        budgetStatus.innerHTML = `
            <div class="budget-header">
                <span>${statusIcon}</span>
                <span>Budget Status: ${statusText}</span>
            </div>
            <div class="budget-bar-container">
                <div class="budget-bar ${barClass}" style="width: ${Math.min(percentageUsed, 100)}%">
                    ${percentageUsed.toFixed(1)}%
                </div>
            </div>
            <div class="budget-details">
                <div class="budget-detail-item">
                    <span class="budget-detail-label">Weekly Budget</span>
                    <span class="budget-detail-value">${budget.budgetLimit} NOK</span>
                </div>
                <div class="budget-detail-item">
                    <span class="budget-detail-label">Already Spent</span>
                    <span class="budget-detail-value">${budget.spent} NOK</span>
                </div>
                <div class="budget-detail-item">
                    <span class="budget-detail-label">This Order</span>
                    <span class="budget-detail-value">${mealPlan.totalCost} NOK</span>
                </div>
                <div class="budget-detail-item">
                    <span class="budget-detail-label">New Total</span>
                    <span class="budget-detail-value" style="color: ${isOverBudget ? '#ff6b6b' : '#4caf50'}">${newTotal} NOK</span>
                </div>
                <div class="budget-detail-item">
                    <span class="budget-detail-label">Remaining</span>
                    <span class="budget-detail-value" style="color: ${isOverBudget ? '#ff6b6b' : '#4caf50'}">${Math.max(0, budget.budgetLimit - newTotal)} NOK</span>
                </div>
            </div>
        `;
    }

    // Group meals by date
    const mealsByDate = {};
    mealPlan.meals.forEach(meal => {
        if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = [];
        }
        mealsByDate[meal.date].push(meal);
    });

    // Render calendar days
    calendarGrid.innerHTML = '';
    const dates = Object.keys(mealsByDate).sort();
    
    dates.forEach(date => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        const dayDate = formatDate(date);
        
        let mealsHtml = '';
        mealsByDate[date].forEach(meal => {
            const mealTypeClass = meal.mealType.replace('_', '-');
            const mealTypeLabel = meal.mealType === 'school_lunch' ? 'School Lunch' : 
                                  meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1);
            
            mealsHtml += `
                <div class="meal-item">
                    <div class="meal-type ${mealTypeClass}">${mealTypeLabel}</div>
                    <div class="meal-name">${meal.recipeName}</div>
                    <div class="meal-details">
                        <div class="meal-detail">⏱️ ${meal.cookingTime} min</div>
                        <div class="meal-detail">👥 ${meal.servings} servings</div>
                        <div class="meal-detail">📊 ${meal.difficulty}</div>
                        <div class="meal-detail">💰 ${meal.cost} NOK</div>
                    </div>
                </div>
            `;
        });
        
        dayCard.innerHTML = `
            <div class="day-header">
                ${dayName}
                <div class="day-date">${dayDate}</div>
            </div>
            ${mealsHtml}
        `;
        
        calendarGrid.appendChild(dayCard);
    });

    // Render inventory usage
    const inventoryUsage = document.getElementById('inventory-usage');
    inventoryUsage.innerHTML = '';
    if (mealPlan.inventoryUsage && mealPlan.inventoryUsage.length > 0) {
        mealPlan.inventoryUsage.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shopping-item';
            itemDiv.style.borderLeftColor = item.isExpiring ? '#ff6b6b' : '#4caf50';
            itemDiv.innerHTML = `
                <div class="shopping-item-name">
                    ${item.name} ${item.isExpiring ? '⚠️' : '✓'}
                </div>
                <div class="shopping-item-qty">Using ${item.quantityUsed} ${item.unit} (have ${item.fromInventory})</div>
                ${item.expirationDate ? `<div class="shopping-item-qty" style="font-size: 0.8em; color: ${item.isExpiring ? '#ff6b6b' : '#666'};">Expires: ${formatDate(item.expirationDate)}</div>` : ''}
            `;
            inventoryUsage.appendChild(itemDiv);
        });
    } else {
        inventoryUsage.innerHTML = '<p style="color: #999; padding: 10px;">No inventory items will be used</p>';
    }

    // Render shopping list
    shoppingItems.innerHTML = '';
    if (mealPlan.shoppingList && mealPlan.shoppingList.length > 0) {
        mealPlan.shoppingList.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shopping-item';
            itemDiv.innerHTML = `
                <div class="shopping-item-name">${item.name}</div>
                <div class="shopping-item-qty">${item.quantity} ${item.unit}</div>
                <div class="shopping-item-qty">${item.estimatedCost} NOK</div>
            `;
            shoppingItems.appendChild(itemDiv);
        });
    } else {
        shoppingItems.innerHTML = '<p style="color: #999; padding: 10px;">No shopping needed - using only inventory!</p>';
    }

    // Show the calendar
    container.classList.add('visible');
    
    // Smooth scroll to calendar
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Format date helper
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Test Budget Tracker
async function testBudgetTracker() {
    const resultDiv = document.getElementById('budget-result');
    const button = event.target;
    
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Testing...';
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.textContent = 'Testing budget tracker...';

    try {
        // Mock budget tracker workflow
        const mockBudget = {
            budgetId: 'budget-' + Date.now(),
            period: 'weekly',
            startDate: '2025-12-02',
            endDate: '2025-12-08',
            budgetLimit: 1200,
            spent: 850,
            remaining: 350,
            orders: ['order-1', 'order-2'],
            alerts: [
                {
                    date: '2025-12-04',
                    level: 'warning',
                    percentage: 50,
                    message: '50% of budget used',
                    acknowledged: false
                },
                {
                    date: '2025-12-06',
                    level: 'warning',
                    percentage: 80,
                    message: '80% of budget used',
                    acknowledged: false
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const percentageUsed = (mockBudget.spent / mockBudget.budgetLimit * 100).toFixed(1);
        const alertsText = mockBudget.alerts.map(a => `  • ${a.message} (${a.date})`).join('\n');

        resultDiv.className = 'result success';
        resultDiv.textContent = '✓ Success! (Mock Response)\n\n' +
            'Budget Status:\n' +
            `• Period: ${mockBudget.period} (${mockBudget.startDate} to ${mockBudget.endDate})\n` +
            `• Budget Limit: ${mockBudget.budgetLimit} NOK\n` +
            `• Spent: ${mockBudget.spent} NOK (${percentageUsed}%)\n` +
            `• Remaining: ${mockBudget.remaining} NOK\n` +
            `• Orders: ${mockBudget.orders.length}\n\n` +
            'Alerts:\n' + alertsText + '\n\n' +
            'To test for real, use AWS CLI:\n' +
            'AWS_CLI_BINARY_FORMAT=raw-in-base64-out aws lambda invoke \\\n' +
            '  --function-name thirdshift-dev-budget-tracker \\\n' +
            '  --payload \'{"action":"get-status","period":"weekly"}\' \\\n' +
            '  --region us-west-2 response.json\n\n' +
            'Full Response:\n' + JSON.stringify(mockBudget, null, 2);
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '✗ Error:\n\n' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Test Budget Tracker';
    }
}

// Load API URL from localStorage if available
window.addEventListener('DOMContentLoaded', () => {
    const savedApiUrl = localStorage.getItem('thirdshift-api-url');
    if (savedApiUrl) {
        document.getElementById('apiUrl').value = savedApiUrl;
    }

    // Save API URL when changed
    document.getElementById('apiUrl').addEventListener('change', (e) => {
        localStorage.setItem('thirdshift-api-url', e.target.value);
    });
});
