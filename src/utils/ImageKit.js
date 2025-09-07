import ImageKit from "imagekit";
import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

// Cloud

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadFile = (file, folderName) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.buffer,
        fileName: new mongoose.Types.ObjectId().toString(),
        folder: `/CodeArena/${folderName}`,
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

const deleteFile = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    throw new ApiError(500, "Error Deleting File from Cloud Storage");
  }
};

export { uploadFile, deleteFile };
