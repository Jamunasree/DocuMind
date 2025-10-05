import { Request, Response, NextFunction } from 'express';
import Document from '../models/Document';
import { ErrorResponse } from '../utils/errorResponse';
import path from 'path';
import fs from 'fs';

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new ErrorResponse('Please upload a file', 400);
    }

    const document = await Document.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      path: req.file.path,
      user: req.user?._id,
      status: 'queued',
    });

    // Here you would trigger document processing
    // For now, we'll just mark it as processed after 2 seconds
    setTimeout(async () => {
      document.status = 'processed';
      document.processedAt = new Date();
      await document.save();
    }, 2000);

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const documents = await Document.find({ user: req.user?._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new ErrorResponse('Document not found', 404);
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id) {
      throw new ErrorResponse('Not authorized to access this document', 401);
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new ErrorResponse('Document not found', 404);
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id) {
      throw new ErrorResponse('Not authorized to delete this document', 401);
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new ErrorResponse('Document not found', 404);
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id) {
      throw new ErrorResponse('Not authorized to access this document', 401);
    }

    if (!fs.existsSync(document.path)) {
      throw new ErrorResponse('File not found on server', 404);
    }

    res.download(document.path, document.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Ask question about document
// @route   POST /api/documents/:id/question
// @access  Private
export const askQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new ErrorResponse('Document not found', 404);
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id) {
      throw new ErrorResponse('Not authorized to access this document', 401);
    }

    // Mock AI response - integrate with your AI service here
    const answer = `Based on the document "${document.originalName}", the answer to your question "${question}" would be found in the document content. This is a mock response.`;
    
    const citations = [
      {
        text: 'Sample citation from the document',
        page: 1,
        confidence: 0.95,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        citations,
      },
    });
  } catch (error) {
    next(error);
  }
};