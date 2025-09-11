'use client';

import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from '@vercel/speed-insights';

// 初始化 Vercel Analytics
inject();

// 初始化 Speed Insights
injectSpeedInsights();
