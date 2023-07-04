import { NextApiRequest, NextApiResponse } from 'next';

import mongooseConnector from '../../../../lib/db/mongooseConnector';
import Profile from '../../../../models/profile';
import UsageRecord from '../../../../models/usageRecord';
import ConversationRecord from '../../../../models/conversationRecord';
import User from '../../../../models/user';
import jwt from 'jsonwebtoken';

export default async (req: NextApiRequest, res: NextApiResponse) => {

        if(req.method !== 'POST') {
            res.status(405).json({
                message: 'Method not allowed'
            });
            return;
        }

        const { token, email, profileId, enableLogging, customerId } = req.body;
        if(!token || !email || !profileId) {
            res.status(400).json({
                message: 'Missing token, email and/or enableLogging flag'
            });
            return;
        }

        try{
            await mongooseConnector();
        }catch(error) {
            console.error('Error connecting to database')
            console.error(error);
            res.status(500).json({
                message: 'Server Error - Please try again later',
            });
            return;
        }

        try{
            const user = await User.findOne({ email, token });
            if(!user) {
                res.status(400).json({
                    message: 'No user found, please check email and api token in request body'
                });
                return;
            }

            const profile = await Profile.findById(profileId);
            if(!profile) {
                res.status(400).json({
                    message: 'Profile does not exist'
                });
                return;
            }

            if(profile.visibility === 'private' && profile.creator.toString() !== user._id.toString()) {
                res.status(400).json({
                    message: 'Profile is not publicly available'
                });
                return;
            }

            let usageRecord = await UsageRecord.findOne({ userId: user._id, date: new Date().setHours(0,0,0,0) });
            if(!usageRecord) {
                usageRecord = new UsageRecord({
                    userId: user._id,
                    messageCount: 0,
                    tokenCount: 0,
                });
                await usageRecord.save();
            }

            const conversationRecord = new ConversationRecord({
                userId: user._id,
                usageId: usageRecord._id,
                profileId,
                customerId,
                loggingEnabled: enableLogging,
                messages: enableLogging ? [] : undefined,
            });

            await conversationRecord.save();

            //Send back jwt in header + payload of 200 response
            const jwtToken = jwt.sign({conversationId: conversationRecord._id}, `${process.env.JWT_SECRET}`, { expiresIn: '1h' });
            res.setHeader('Set-Cookie', `gholaJwt=${jwtToken}; Path=/; HttpOnly`);
            res.status(200).json({
                message: 'Conversation Record created',
                jwt: jwtToken,
            });

            return;

        } catch(error) {
            console.error(error);
            res.status(500).json({
                message: 'Server Error - Please try again later',
            });
            return;
        }

            
}