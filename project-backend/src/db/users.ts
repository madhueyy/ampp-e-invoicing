// File used to create schemas to connect to mongoDB
// database online

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },
    files: [{ format: String, data: mongoose.Schema.Types.Mixed }]
});

export const UserModel = mongoose.model('User', UserSchema);

export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject());
export const getUserUsingSessionToken = (sessionToken: string) => UserModel.findOne({ 'authentication.sessionToken': sessionToken });
export const getUserUsingEmail = (email: string) => UserModel.findOne({ email });
export const getUsers = () => UserModel.find();
export const deleteUserUsingEmail = async (email: string) => UserModel.findOneAndDelete({ email });
export const getFilesUsingInvoiceId = (invoiceId: string) => UserModel.findOne({ 'files._id': invoiceId });