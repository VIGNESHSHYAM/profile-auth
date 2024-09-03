"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userschema = new mongoose_1.default.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    facultyName: { type: String, required: true },
    semester: { type: String, required: true },
    emailId: { type: String, required: true },
    department: { type: String, required: true },
    UG_OR_PG: { type: String, require: true },
    mobile_number: { type: Number, require: true },
    Gender: { type: String, require: true },
    DOB: { type: String, require: true },
    Specialization: { type: String, require: true },
    SRMIST_Mail_ID: { type: String, require: true },
    alternate_number: { type: Number, require: true },
    Section: { type: String, require: true },
});
const User = mongoose_1.default.model('User', userschema);
exports.default = User;
