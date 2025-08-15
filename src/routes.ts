
export const publicRoutes = [
   "/",
   "/blog",
   "/about",
   "/tools",
   "/contact",
   "/services",
   "/privacy-policy",
   "/terms-and-conditions",
   "/disclosure-ia",
   "/disclosure-ra",
   "/grievance-redressal",
   "/investor-charter",
   "/blog/:path*",
   "/api/payment/notify",
   "/api/cron/expiry-notify",

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
