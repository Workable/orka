import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    name: { type: String, unique: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    initialized: Boolean,
    finished: Boolean
  },
  { timestamps: {} }
);

export interface IJob {
  payload: any;
  name: string;
  initialized: boolean;
  finished: boolean;
}

const Job = mongoose.model<IJob>('WorkerJob', jobSchema);
export default Job;
export type JobDocument = ReturnType<typeof Job['hydrate']>;
