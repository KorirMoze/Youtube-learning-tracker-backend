import * as videoService from '../services/videos.service.js';

export async function createVideo(req, res, next) {
  try {
    const video = await videoService.logVideo(req.user.userId, req.body);

    res.status(201).json({
      status: 'success',
      data: video,
    });
  } catch (err) {
    next(err);
  }
}

export async function listVideos(req, res, next) {
  try {
    const data = await videoService.getVideos(req.user.userId, req.query);

    res.json({
      status: 'success',
      ...data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVideo(req, res, next) {
  try {
    const video = await videoService.getVideoById(
      req.user.userId,
      req.params.id
    );

    if (!video) {
      return res.status(404).json({
        status: 'error',
        message: 'Video not found',
      });
    }

    res.json({ status: 'success', data: video });
  } catch (err) {
    next(err);
  }
}

export async function updateVideo(req, res, next) {
  try {
    const video = await videoService.updateVideo(
      req.user.userId,
      req.params.id,
      req.body
    );

    if (!video) {
      return res.status(404).json({
        status: 'error',
        message: 'Video not found',
      });
    }

    res.json({ status: 'success', data: video });
  } catch (err) {
    next(err);
  }
}

export async function removeVideo(req, res, next) {
  try {
    const deleted = await videoService.deleteVideo(
      req.user.userId,
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Video not found',
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
