// This file contains multer middleware for handling file uploads

import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage
}).single('xmlFile');