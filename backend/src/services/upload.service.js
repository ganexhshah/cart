const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');
const logger = require('../utils/logger');

class UploadService {
  /**
   * Upload image to Cloudinary
   * @param {Buffer} buffer - Image buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(buffer, options = {}) {
    try {
      const {
        folder = 'restaurant',
        width = 1200,
        height = 800,
        quality = 80,
        format = 'jpg'
      } = options;

      // Optimize image with Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toBuffer();

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            format,
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              logger.info(`Image uploaded: ${result.public_id}`);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format
              });
            }
          }
        );

        uploadStream.end(optimizedBuffer);
      });
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload menu item image
   */
  async uploadMenuItemImage(buffer) {
    return this.uploadImage(buffer, {
      folder: 'restaurant/menu-items',
      width: 800,
      height: 600
    });
  }

  /**
   * Upload restaurant logo
   */
  async uploadRestaurantLogo(buffer) {
    return this.uploadImage(buffer, {
      folder: 'restaurant/logos',
      width: 400,
      height: 400
    });
  }

  /**
   * Upload restaurant cover image
   */
  async uploadRestaurantCover(buffer) {
    return this.uploadImage(buffer, {
      folder: 'restaurant/covers',
      width: 1920,
      height: 600
    });
  }

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(buffer) {
    return this.uploadImage(buffer, {
      folder: 'restaurant/avatars',
      width: 300,
      height: 300
    });
  }

  /**
   * Upload review image
   */
  async uploadReviewImage(buffer) {
    return this.uploadImage(buffer, {
      folder: 'restaurant/reviews',
      width: 800,
      height: 600
    });
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted: ${publicId}`);
      return result;
    } catch (error) {
      logger.error('Image deletion failed:', error);
      throw error;
    }
  }

  /**
   * Generate QR code and upload
   */
  async uploadQRCode(qrCodeBuffer, tableId) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/qr-codes',
            public_id: `table-${tableId}`,
            resource_type: 'image',
            format: 'png'
          },
          (error, result) => {
            if (error) {
              logger.error('QR code upload error:', error);
              reject(error);
            } else {
              logger.info(`QR code uploaded: ${result.public_id}`);
              resolve({
                url: result.secure_url,
                publicId: result.public_id
              });
            }
          }
        );

        uploadStream.end(qrCodeBuffer);
      });
    } catch (error) {
      logger.error('QR code upload failed:', error);
      throw error;
    }
  }
}

module.exports = new UploadService();
