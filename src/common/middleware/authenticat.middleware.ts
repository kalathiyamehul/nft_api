import { Request, Response, NextFunction } from 'express';
import { getManager } from 'typeorm';

export async function authenticat(req: Request, res: Response, next: NextFunction) {
    const queryManager = getManager();
    const deviceToken = req.get("device_token");
    const query = `SELECT * FROM users WHERE device_token = '${deviceToken}'`;
    var userData = await queryManager.query(query);
    if (userData.length === 0 && deviceToken !== '' && deviceToken !== undefined) {
        res.status(400).json({
            statusCode: 402,
            message: 'This login used in other device',
        });
    }
    else {
        next();
    }
};