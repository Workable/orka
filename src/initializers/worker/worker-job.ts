import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Job = new Schema(
  {
    name: { type: String, unique: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    initialized: Boolean,
    finished: Boolean
  },
  { timestamps: {} }
);

export interface JobDocument extends mongoose.Document {
  payload: any;
  name: string;
  initialized: boolean;
  finished: boolean;
}

export type JobModel = mongoose.Model<JobDocument>;

export default mongoose.model<JobDocument, JobModel>('WorkerJob', Job);
