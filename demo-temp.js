const chart = [
     { month: "January", desktop: 186, mobile: 80 },
     { month: "February", desktop: 305, mobile: 200 },
     { month: "March", desktop: 237, mobile: 120 },
     { month: "April", desktop: 73, mobile: 190 },
     { month: "May", desktop: 209, mobile: 130 },
     { month: "June", desktop: 214, mobile: 140 },
     { month: "June", desktop: 214, mobile: 140 },
   ]
  


INSERT INTO "ServiceResearchAdvisoryMutualFunds" (
  id,
  chart,
  "serviceHighlights",
  faq,
  price,
  "discountedPrice",
  duration,
  "stockList",
  recommendation,
  "isAvailable",
  "createdAt",
  "updatedAt"
) VALUES (
  'b7e2a1c2-9d4e-4f3a-8c2e-1a2b3c4d5e6f',
  '[
    {"month": "January", "desktop": 186, "mobile": 80},
    {"month": "February", "desktop": 305, "mobile": 200},
    {"month": "March", "desktop": 237, "mobile": 120},
    {"month": "April", "desktop": 73, "mobile": 190},
    {"month": "May", "desktop": 209, "mobile": 130},
    {"month": "June", "desktop": 214, "mobile": 140},
    {"month": "June", "desktop": 214, "mobile": 140}
  ]'::jsonb,
  '{"highlights": ["Expert research", "Long-term focus", "Personalized support"]}'::jsonb,
  '{"faq": [{"q": "What is ValueVest?", "a": "A long-term research advisory service."}]}'::jsonb,
  999.00,
  799.00,
  12,
  '[{"name": "ABC Corp", "research_report_document": "abc.pdf", "buy_range": "100-120", "holding_period": "12M", "target_price": 150, "status": "active"}]'::jsonb,
  ARRAY['Buy and Hold', 'Diversified'],
  TRUE,
  NOW(),
  NOW()
);