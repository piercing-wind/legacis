
export const publicRoutes = [
   "/",
   "/blog",
   "/about",
   "/tools",
   "/contact",
   "/services",
   "/ia-services",
   "/ra-services",
   "/platina-wealth",
   "/mutual-funds",
   "/services/:path*",
   "/ia-services/:path*",
   "/ra-services/:path*",
   "/periodic-submission",
   "/privacy-policy",
   "/terms-and-conditions",
   "/mitc-ia",
   "/mitc-ra",
   "/disclosure-ia",
   "/disclosure-ra",
   "/grievance-redressal",
   "/investor-charter-ia",
   "/investor-charter-ra",
   "/blog/:path*",
   "/api/payment/notify",
   "/api/payment/notify/ia",
   "/api/payment/notify/ra",
   "/api/cron/expiry-notify",
   '/error',
   "/api/migrate", // temporary, will be removed after migration is done
]

export const authRoutes = [
   '/authenticate',
]

/*
The Prefix for  API authentication routes.
Routes with this prefix are used for API authentication.
@type {string}
*/
export const apiRoutesPrefix = "/api/"
