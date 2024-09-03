"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const zod_1 = require("zod");
const server_1 = require("@trpc/server");
const trpc_1 = require("./trpc");
const auth_1 = require("./auth");
const authmodel_1 = __importDefault(require("./usermodel/authmodel"));
// Define the input schema for registration
const RegisterInputSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string(),
    password: zod_1.z.string(),
    name: zod_1.z.string(),
    facultyName: zod_1.z.string(),
    semester: zod_1.z.string(),
    emailId: zod_1.z.string().email(),
    department: zod_1.z.string(),
    UG_OR_PG: zod_1.z.string(),
    mobile_number: zod_1.z.number(),
    Gender: zod_1.z.string(),
    DOB: zod_1.z.string(),
    Specialization: zod_1.z.string(),
    SRMIST_Mail_ID: zod_1.z.string().email(),
    alternate_number: zod_1.z.number(),
    Section: zod_1.z.string(),
});
// Define the input schema for login
const LoginInputSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.appRouter = (0, trpc_1.router)({
    // Registration procedure
    register: trpc_1.procedure
        .input(RegisterInputSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const { registrationNumber, password, name, facultyName, semester, emailId, department, UG_OR_PG, mobile_number, Gender, DOB, Specialization, SRMIST_Mail_ID, alternate_number, Section, } = input;
        // Check if user already exists
        const existingUser = yield authmodel_1.default.findOne({ registrationNumber });
        if (existingUser) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'User already exists',
            });
        }
        // Hash the password before saving
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const user = new authmodel_1.default({
            registrationNumber,
            password: hashedPassword,
            name,
            facultyName,
            semester,
            emailId,
            department,
            UG_OR_PG,
            mobile_number,
            Gender,
            DOB,
            Specialization,
            SRMIST_Mail_ID,
            alternate_number,
            Section,
        });
        // Save the user to the database
        yield user.save();
        return { success: true };
    })),
    // Login procedure
    login: trpc_1.procedure
        .input(LoginInputSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        const { registrationNumber, password } = input;
        // Find the user by registration number
        const user = yield authmodel_1.default.findOne({ registrationNumber });
        if (!user) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        // Verify the password
        const isPasswordValid = yield (0, auth_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid password',
            });
        }
        // Create a JWT token
        const token = (0, auth_1.createJWT)(user.registrationNumber);
        // Store user details in session
        ctx.session = {
            userDetails: {
                registrationNumber: user.registrationNumber,
                name: user.name,
                facultyName: user.facultyName,
                semester: user.semester,
                emailId: user.emailId,
                department: user.department,
                UG_OR_PG: user.UG_OR_PG || '',
                mobile_number: user.mobile_number || 0, // Assuming 0 is a safe fallback
                Gender: user.Gender || '',
                DOB: user.DOB || '',
                Specialization: user.Specialization || '',
                SRMIST_Mail_ID: user.SRMIST_Mail_ID || '',
                alternate_number: user.alternate_number || 0, // Assuming 0 is a safe fallback
                Section: user.Section || '',
            },
        };
        return {
            token,
            userDetails: ctx.session.userDetails,
        };
    })),
    // Get user details procedure
    getUserDetails: trpc_1.procedure
        .query(({ ctx }) => {
        if (!ctx.session || !ctx.session.userDetails) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'User not logged in',
            });
        }
        return ctx.session.userDetails;
    }),
});
