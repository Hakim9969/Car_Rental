import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';


@Injectable()
export class CloudinaryService {
    constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadImage(fileBuffer: Buffer, folder = 'car-rental'): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
  if (error || !result) return reject(error || new Error('Upload failed'));
  resolve(result.secure_url);
}
      );

      Readable.from(fileBuffer).pipe(stream);
    });
  }
}
