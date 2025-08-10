import { ServiceType } from "@/prisma/generated/client";

export const getColorForCardByServiceType = (serviceType?: ServiceType) => {
   switch (serviceType) {
      case ServiceType.RESEARCH_ADVISORY:
         const colors = {
            color : '#4AEDB9',
            color_l : '#74EDB9',
            card_tw : 'border-legacisGreen/30 shadow-[0_0_16px_0_rgba(74,237,185,0.3)]',
            btn_tw : 'border-legacisGreen/30 bg-legacisGreen/60 dark:bg-legacisGreen/70'
         }
         return colors;
      case ServiceType.RESEARCH_ADVISORY_MUTUAL_FUNDS:
         const colors2 = {
            color : '#ff86fb',
            color_l : '#ff9cfc',
            card_tw : 'border-[#ff9cfc]/50 shadow-[0_0_16px_0_rgba(255,156,252,0.5)]',
            btn_tw : 'border-[#FA2EF3]/30 bg-[#FA2EF3]/40 dark:bg-[#ff65fa]/70'
         }
         return colors2;
      case ServiceType.RESEARCH_ADVISORY_MODEL_PORTFOLIO:
         const colors3 = {
            color : '#4b4eff',
            color_l : '#8587ff',
            card_tw : 'border-[#4b4eff]/30 shadow-[0_0_16px_0_rgba(75,78,255,0.3)]',
            btn_tw : 'border-[#4b4eff]/30 bg-[#8587ff]/60 dark:bg-[#8587ff]/80'
         }
         return colors3;
      case ServiceType.PLATINA_WEALTH:
         const colors4 = {
            color : '#a684ff',
            color_l : '#a684ff',
            card_tw : 'border-[#b972ff]/30 shadow-[0_0_16px_0_rgba(185,114,255,0.2)]',
            btn_tw : 'border-purple-500/30 bg-purple-400/30 dark:bg-purple-300/80'
         }
         return colors4;
      case ServiceType.SMALLCASE:
         const colors5 = {
            color : '#1f7ae0',
            color_l : '#1f7ae0',
            card_tw : 'border-[#1f7ae0]/30 shadow-[0_0_16px_0_rgba(31,122,224,0.3)]',
            btn_tw : 'border-[#1f7ae0]/30 bg-[#1f7ae0]/50 dark:bg-[#1f7ae0]'
         }
         return colors5;
      case ServiceType.COMBO:
         const colors6 = {
            color : '#fff7c3',
            color_l : '#f7e571',
            card_tw : 'border-[#fff7c3] dark:border-[#fff7c3]/50 shadow-[0_0_16px_0_rgba(255,247,195,1)] dark:shadow-[0_0_16px_0_rgba(255,247,195,0.3)]',
            btn_tw : 'border-[#fff7c3] bg-[#fff7c3] dark:bg-[#fff7c3]/60'
         }
         return colors6;
      default:
         const defaultColors = {
            color : '#4AEDB9',
            color_l : '#74EDB9',
            card_tw : 'border-legacisGreen/30 shadow-[0_0_16px_0_rgba(74,237,185,0.3)]',
            btn_tw : 'border-legacisGreen/30 bg-legacisGreen/80 dark:bg-legacisGreen/70'
         }
         return defaultColors;
   }
}