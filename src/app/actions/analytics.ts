"use server";

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { checkAdminSession } from "./adminAuth";

export async function getWebTrafficData() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  const credentialsBase64 = process.env.GA4_CREDENTIALS_BASE64;

  if (!propertyId || !credentialsBase64) {
    return { error: "GA4 API is not configured properly. Missing env vars." };
  }

  try {
    const { safeParseJson } = await import("@/lib/firebaseAdmin");
    const credentialsJson = Buffer.from(credentialsBase64, "base64").toString("utf-8");
    const credentials = safeParseJson(credentialsJson);

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key?.replace(/\\n/g, "\n"),
      },
      projectId: credentials.project_id,
    });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [
        {
          name: "date",
        },
      ],
      metrics: [
        {
          name: "screenPageViews",
        },
        {
          name: "sessions",
        },
        {
          name: "activeUsers",
        }
      ],
    });

    if (!response.rows) {
      return { data: [], totals: { pageViews: 0, sessions: 0, activeUsers: 0 } };
    }

    // Format data for Recharts (e.g., sort by date)
    const formattedData = response.rows.map(row => {
      const rawDate = row.dimensionValues?.[0].value || "";
      // Format YYYYMMDD to a readable short date for graphs (e.g. "Jul 6")
      let formattedDate = rawDate;
      if (rawDate.length === 8) {
        const year = parseInt(rawDate.substring(0, 4));
        const month = parseInt(rawDate.substring(4, 6)) - 1;
        const day = parseInt(rawDate.substring(6, 8));
        const d = new Date(year, month, day);
        formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      return {
        dateString: row.dimensionValues?.[0].value || "", // keep original for sorting
        date: formattedDate,
        pageViews: parseInt(row.metricValues?.[0].value || "0", 10),
        sessions: parseInt(row.metricValues?.[1].value || "0", 10),
        activeUsers: parseInt(row.metricValues?.[2].value || "0", 10),
      };
    }).sort((a, b) => a.dateString.localeCompare(b.dateString));

    // Summary totals
    const totals = {
      pageViews: formattedData.reduce((acc, curr) => acc + curr.pageViews, 0),
      sessions: formattedData.reduce((acc, curr) => acc + curr.sessions, 0),
      activeUsers: formattedData.reduce((acc, curr) => acc + curr.activeUsers, 0),
    };

    return { data: formattedData, totals };

  } catch (error: any) {
    console.error("GA4 API Error:", error);
    return { error: error.message || "Failed to fetch analytics data." };
  }
}
