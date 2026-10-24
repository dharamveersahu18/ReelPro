import mongoose, { Schema, models, model } from "mongoose";
//35

export const VIDEO_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    qualtity?: number;
  };
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, requird: true },
    thumbnailUrl: { type: String, required:true},
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS },
      width: { type: Number, default: VIDEO_DIMENSIONS },
      qualtity: { type: Number, min: 1, maxx: 100 },
    },
  },
  { timestamps: true },
);


const Video = models?.Video || model<IVideo>("Video",videoSchema);

export default  Video;