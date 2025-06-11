import { auth } from "@/auth";
import { authRoutes, publicRoutes } from "./routes";

export default auth((req, ctx)=>{
   const isLoggedIn = !!req.auth;
   const nextUrl = req.nextUrl;
   const route = nextUrl.pathname;

   const isApiAuthRoute = route.startsWith("/api/auth");
   
   const isPublicRoute = publicRoutes.some((publicRoute) => {
      if (publicRoute.endsWith("/:path*")) {
        const base = publicRoute.replace("/:path*", "");
        return route === base || route.startsWith(base + "/");
      }
      return route === publicRoute;
   });

   const isAuthRoute = authRoutes.includes(route);

   if(isApiAuthRoute){
        return;
   }
   
   if (isAuthRoute) {
      if (isLoggedIn) {
         return Response.redirect(new URL("/", nextUrl));
      }
      return
   }

   if(!isLoggedIn && !isPublicRoute){
      return Response.redirect(new URL(`/authenticate?callbackurl=${encodeURIComponent(route)}`, nextUrl));
   }

   return; 
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};