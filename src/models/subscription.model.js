import mongoose, {Schema} from 'mongoose'

const SubscriptionSchema = new Schema( {
    subscriber: { //user that subscribes to the channel
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: { //owner of account. this stores the channel name
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})


export const Subscription = mongoose.model( 'Subscription', SubscriptionSchema)