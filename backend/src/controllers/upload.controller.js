const uploadService = require('../services/upload.service');

class UploadController {
  async uploadMenuItemImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const result = await uploadService.uploadMenuItemImage(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Menu item image uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadRestaurantLogo(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const result = await uploadService.uploadRestaurantLogo(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Restaurant logo uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadRestaurantCover(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const result = await uploadService.uploadRestaurantCover(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Restaurant cover image uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadUserAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const result = await uploadService.uploadUserAvatar(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadReviewImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No image files provided'
        });
      }

      const uploadPromises = req.files.map(file => 
        uploadService.uploadReviewImage(file.buffer)
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        data: results,
        message: 'Review images uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required'
        });
      }

      await uploadService.deleteImage(publicId);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
