"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("../prisma/generated/client");
const db = globalThis.prisma || new client_1.PrismaClient();
exports.db = db;
if (process.env.NODE_ENV !== "production")
    globalThis.prisma = db;
