import mongoose, {Schema} from 'mongoose'

const SubscriptionSchema = new Schema( {
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: { //owner of account
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})


export const Subscription = mongoose.model( 'Subscription', SubscriptionSchema)