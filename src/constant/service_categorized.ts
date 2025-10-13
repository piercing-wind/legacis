/**
 * This file controls which services fall under the IA (Investment Advisory) category for the frontend.
 *
 * - The IA_SERVICES list includes all the IA services and is used to display services on the ia-services page.
 * - The RA (Research Advisory) services page displays all services except those in this list (vice versa).
 *
 * - Payment gateway selection logic is also based on these lists.
 *
 * Usage:
 *   - Import IA_SERVICES to filter or categorize services throughout the app.
 *   - Use utility functions (if defined) to check if a service is IA or RA.
 *
 * To add a new IA service, update the IA_SERVICES array below.
 */

import { ServiceType } from "@/prisma/generated/client";

export const investment_advisory_services : ServiceType[] = [
    ServiceType.MUTUAL_FUNDS,
    ServiceType.PORTFOLIO_REVIEW,
    ServiceType.PLATINA_WEALTH
  ]