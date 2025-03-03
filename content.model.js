import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  vector: {
    type: [Number],
    required: true,
    validate: {
      validator: v => v.length === 1536,
      message: 'Vector must be 1536-dimensional'
    }
  }
});

const ContentModel = mongoose.model('Content', contentSchema);
export default ContentModel;