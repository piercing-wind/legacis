import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   turbopack: {
     resolveAlias: {
       canvas: './empty-module.ts',
     },
   },
   images : {
      remotePatterns : [
         {
            protocol : 'https',
            hostname : 'legacis-capital.s3.ap-south-1.amazonaws.com'
         }
      ]
   }
};

export default nextConfig;
