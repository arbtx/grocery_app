import {Customer, DeliveryPartner} from '../../models/user.js'
import jwt from 'jsonwebtoken'

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        {userId: user._id, role: user.role},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '1d'}
    )

    const refreshToken = jwt.sign(
        {userId: user._id, role: user.role},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )

    return {accessToken, refreshToken}
}

export const loginCustomer = async (req, reply) => {
    try {
        const {phone} = req.body;
        let customer = await Customer.findOne({phone});

        if (!customer) {
            customer = new Customer({phone, role: 'Customer', isActive: true});

        await customer.save();
        }
        const {accessToken, refreshToken} = generateTokens(customer);
        return reply.send({
            message: 'Login successful',
            accessToken,
            refreshToken,
            customer
        })
    } catch (error) {
        console.error('Error in loginCustomer:', error)
        reply.code(500).send({message: 'Internal Server Error'});

    }
}

export const loginDeliveryPartner = async (req, reply) => {
    try {
        const {email, password} = req.body;
        const deliveryPartner = await DeliveryPartner.findOne({email});

        if (!deliveryPartner) {
            return reply.code(404).send({message: 'Delivery Partner not found'});
        }
        const isPasswordValid = await DeliveryPartner.comparePassword(password);
        if (!isPasswordValid) {
            return reply.code(401).send({message: 'Invalid password'});
        }
        const {accessToken, refreshToken} = generateTokens(deliveryPartner);
        return reply.send({
            message: 'Login successful',
            accessToken,
            refreshToken,
            deliveryPartner
        })
    } catch (error) {
        return reply.status(500).send({message: 'Internal Server Error', error});
    }   
};

export const refreshToken = async (req, reply) => {
    const {refreshToken} = req.body

    if (!refreshToken) {
        return reply.code(401).send({message: 'Refresh token is required'})
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        let user;
        if (decoded.role === 'Customer') {
            user = await Customer.findById(decoded.userId)
        } else if (decoded.role === 'DeliveryPartner') {
            user = await deliveryPartner.findById(decoded.userId)
        }

        else {
            return reply.code(403).send({message: 'Invalid role in token'})
        }
        if (!user) {
            return reply.code(403).send({message: 'User not found'})
        }

        const {accessToken, refreshToken: newRefreshToken} = generateTokens(user)
        return reply.send({
            message: 'Tokens refreshed successfully',
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        return reply.status(403).send({message: "Invalid Refresh Token"});
    }
}

export const fetchUser = async (req, reply) => {
    try {
        const {userId, role} = req.user;
        let user;

        if (role === 'Customer') {
            user = await Customer.findById(userId);
        } else if (role === 'DeliveryPartner') {
            user = await deliveryPartner.findById(userId);
        } else {
            return reply.code(404).send({message: 'Invalid role'});
        }

        if (!user) {
            return reply.code(404).send({message: 'User not found'});
        }

        return reply.send({
            message: 'User fetched successfully',
            user
        });
    } catch (error) {
        return reply.code(500).send({message: 'Internal Server Error', error});
    }
}
