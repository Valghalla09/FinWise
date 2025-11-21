import { type FinancePost } from '@/types/learnFinance'

export const DEFAULT_LEARNING_POSTS: Omit<FinancePost, 'id' | 'createdAt' | 'approvedAt' | 'likes' | 'views' | 'rejectionReason'>[] = [
  {
    title: 'Student Finance 101: Managing Money in College',
    content: `Student Finance 101: Managing Money in College

1. Know Your Money
- List all your income sources (allowance, part-time job, scholarship).
- Track your expenses so you know where your money really goes.

2. Make a Simple Budget
- Follow the 50-30-20 rule (optional but helpful):
  - 50% Needs – food, transport, school supplies
  - 30% Wants – snacks, hobbies, entertainment
  - 20% Savings – emergency fund, future goals
- If 50-30-20 doesn’t fit your life, just make your own categories and assign limits.

3. Spend Smart
- Buy second-hand books or borrow from the library.
- Use student discounts everywhere (restaurants, apps, transport).
- Avoid impulse buying—wait 24 hours before buying non-essentials.

4. Save Even Small Amounts
- Keep a small emergency fund (₱20–₱50 a day adds up).
- Save part of your allowance or income every week.

5. Avoid Debt (If You Can)
- Don’t rely on credit if you don’t have stable income.
- If you must borrow, choose interest-free or low-interest options.
- Pay back on time.

6. Track Your Progress
- Use a notebook or a budgeting app to monitor your spending.
- Review your budget every month and adjust your categories.

7. Build Good Habits Early
- Learn basic financial skills: budgeting, saving, comparing prices.
- Practice discipline—your small habits now will help your future self.`,
    category: 'student',
    tags: ['student-finance', 'college-budget', 'beginner-tips'],
    authorId: 'system',
    authorName: 'FinWise Guide',
    status: 'approved',
    featured: true
  },
  {
    title: 'Budgeting Basics for Working Students',
    content: `Budgeting Basics for Working Students

1. Understand Your Income
- List all sources: allowance, part-time job, commissions, side hustles.
- Focus on your “sure” income (what you get every month), not random bonuses.

2. Build a Weekly Budget
- Base your plan on how often you get paid (weekly, bi-weekly, monthly).
- Cover your non‑negotiables first: transport, food, school needs, data/load.
- Set a simple rule like 60-30-10:
  - 60% Needs – bills, food, transport
  - 30% Wants – snacks, hangouts, hobbies
  - 10% Savings – emergency fund or goals

3. Handle Irregular Pay
- Plan your budget using the lowest income you usually receive.
- Treat extra shifts, tips, or bonuses as “bonus money” for savings or debt.

4. Separate Your Money
- Use envelopes or separate e-wallets/accounts for Needs, Wants, and Savings.
- Keep bill money and tuition money in a “do not touch” place.

5. Pay Yourself First
- Every payday, move a small amount to savings before you spend anything.
- Even ₱50–₱100 per payday builds up if you stay consistent.

6. Protect Your Time and Energy
- Plan your week so work doesn’t destroy your study time and health.
- When you’re tired, you’re more likely to overspend on convenience (delivery, taxis).
- Prepare snacks or simple meals in advance to save money.

7. Common Mistakes to Avoid
- Spending the whole paycheck on Day 1.
- Saying “I’ll save what’s left” (often nothing is left).
- Relying on debt to friends, buy now pay later, or credit cards.
- Ignoring small daily leaks like extra milk tea, random app purchases, or delivery fees.

Remember: as a working student, your goal is not just to survive this month, but to protect your future energy, time, and money. A simple budget is your shield.`,
    category: 'budgeting',
    tags: ['working-student', 'part-time-job', 'budgeting', 'college'],
    authorId: 'system',
    authorName: 'FinWise Guide',
    status: 'approved',
    featured: false
  },
  {
    title: 'Beginner Money Habits: Start Even If You Feel Broke',
    content: `Beginner Money Habits: Start Even If You Feel Broke

1. Start Where You Are
- No shame about your current situation.
- You don’t need a big income to build good habits—start with what you have.

2. Track One Thing First
- For one week, just track where your cash goes (snacks, rides, games, etc.).
- Seeing the numbers clearly is the first step to change.

3. Build a Tiny Emergency Buffer
- Aim for a small first goal (₱500, ₱1,000, then ₱5,000).
- Save ₱10–₱50 whenever you can and keep it separate from spending money.

4. Use Simple Rules to Control Spending
- 24-hour rule: wait one day before buying non‑essential items.
- Make a short list before you go out or open shopping apps—and stick to it.
- Prefer cash or prepaid e-wallets for “wants” so you can’t overspend easily.

5. Set Clear, Small Goals
- Short term: “I want ₱1,000 for emergency load and fare.”
- Medium term: “I want ₱5,000 for school fees or a gadget upgrade.”
- Long term: “I want savings for moving out, business, or investments later.”

6. Make Good Habits Easy
- Automate small transfers if possible (e.g., every payday).
- Put your savings somewhere slightly harder to access.
- Unfollow or mute accounts/shops that constantly tempt you to spend.

7. Celebrate Progress, Not Perfection
- Focus on direction, not speed—consistency beats intensity.
- When you make a mistake, review what happened and adjust instead of giving up.

Your goal as a beginner is simple: understand your money, control small leaks, and build habits you can maintain for years.`,
    category: 'general',
    tags: ['beginners', 'money-habits', 'personal-finance'],
    authorId: 'system',
    authorName: 'FinWise Guide',
    status: 'approved',
    featured: false
  }
]
