
export const publicRoutes = [
   "/",
   "/blog",
   "/blog/:path*",
   "/services",
   "/services/:path*",
   "/api/payment/notify",
   "thankyou",

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
