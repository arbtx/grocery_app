import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import {dark, light, noSidebar} from '@adminjs/themes'

AdminJS.registerAdapter(AdminJSMongoose)

export const admin = new AdminJS({
    resources: [{
        resource: Models.Customer,
        options: {
            listProperties: ['phone', 'role', 'isActivated'],
            filterProperties: ['phone', 'role'],
        },

    },
    {
        resource: Models.DeliveryPartner,
        options: {
            listProperties: ['phone', 'name', 'isActivated'],
            filterProperties: ['phone', 'name'],
        },
    },
    {
        resource: Models.Admin,
        options: {
            listProperties: ['phone', 'name', 'isActivated'],
            filterProperties: ['phone', 'name']
        },
    },
    {resource: Models.Branch},
    {resource: Models.Category},
    {resource: Models.Product},
    {resource: Models.Order},
    {resource: Models.Counter},

    ], branding: {
        companyName: 'Himachal Janta Store',
        withMadeWithLove: false,
    },
    defaultTheme: dark.id,
    rootPath: '/admin',
    availableThemes: [light, dark, noSidebar],
});

export const buildAdminRouter = async (app) => {
    await AdminJSFastify.buildAuthenticatedRouter(
        admin,
        {
            authenticate, 
            cookieName: 'adminjs',
            cookiePassword: COOKIE_PASSWORD,
        },
        app,
        {
            store: sessionStore,
            saveUninitialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            },  
        }
    );
};