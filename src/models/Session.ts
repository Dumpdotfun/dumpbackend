import { default as mongoose, Schema } from "mongoose";

const SessionsSchema = new Schema(
  {
    socketId: { type: String, require: true },
    userId: { type: String, require: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const SessionModel = mongoose.model("sessions", SessionsSchema);

export default SessionModel;
