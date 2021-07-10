import express, { Request, Response } from "express";
import { User, userArray } from "../models/user";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userRouter = express.Router();


/*
    Responds to a Get request received at /Users
    returns an array of all available users
*/    
userRouter.get("/",(_req,res,next)=>
{
    res.status(200).send(userArray);
});

/*
    Responds to a Get requests received at /Users/:userId where the userId portion is dynamic
    this returns a user if the user is found within the userArray matching the given :userId
    otherwise this returns status 404 user not found
*/
userRouter.get("/:userId",(req,res,next)=>
{
    let foundUser = findAndReturnUser(req,res);
    if(foundUser)
        res.status(200).send(foundUser);
});


/*
    Responds to a Post request recieved at /Users 
    creates a new user record with the information provided if the userId provided
    isn't already in the system.
    If the userId provided already exists it returns an error 409 (Conflict)
    If all the required properties for a given user object aren't privided it returns status 406 UnAcceptable
*/    
userRouter.post("/", (req,res,next)=>{
    
    let newUser = userArray.find(u=>u.userId.toLowerCase()===req.body.userId.toLowerCase());
    if(newUser!=undefined)
    {
        res.status(409).send({message:'Duplicate userId', status:409});
    }
    else if(req.body.userId && req.body.firstName && req.body.lastName && req.body.emailAddress)
    {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                // Store hash in your password DB.
                newUser = new User(req.body.userId, req.body.firstName, req.body.lastName,req.body.emailAddress, hash);
                userArray.push(newUser);

                res.status(201).send(newUser);
            })
        })

        
    }
    else
        res.status(406).send({message:'userId,firstName,lastName and emailAddress are all required fields!'});
})


/*
    Responds to a Patch Request at /Users/:userId
    It looksup a user in the userArray given the dynamic userId passed in the url.
    If user is found updates are made according to the payload.
    If user isn't found status 404 (not Found) is returned.
*/
userRouter.patch("/:userId", (req,res,next)=>{
    let foundUser = findAndReturnUser(req,res);
    if(foundUser!==undefined)
    {
        if(req.body.firstName)
        {
            foundUser.firstName = req.body.firstName;
        }
        if(req.body.lastName)
        {
            foundUser.lastName = req.body.lastName;
        }
        if(req.body.emailAddress)
        {
            foundUser.emailAddress = req.body.emailAddress;
        }
        res.status(202).send(foundUser);
    }

});

/*
    Responds to a Delete Request at endpoint /Users/:userId
    It looks for and removes the given userId (from the dynamic url segment) from the userArray
    If the user isn't found 404 (Not Found) status is returned.
*/
userRouter.delete("/:userId", (req,res,next)=>{
    if(req.headers.token)
    {
        try
        {
            let tokenPayload = jwt.verify(req.headers.token.toString(), 'dekhgfdsghuvxv') as unknown as {userId:string, firstName:string, iat:string, exp:number, sub:string};
            console.log(tokenPayload);
            let foundUser = findAndReturnUser(req,res);
            if(tokenPayload.userId===req.params.userId)
            {
                if(foundUser!==undefined)
                {
            
                    userArray.splice(userArray.findIndex(u=>u.userId===foundUser?.userId),1);
                    res.status(200).send({message:'User Deleted'});
                }
            }
            else
            {
                res.status(401).send({message: 'Not Authorized to Delete'});
            }
        }
        catch (ex) //Invalid Token
        {
            console.log(ex);
            res.status(401).send({message: 'Invalid Token'});
        }
    }
    else
    {
        res.status(401).send({message: 'Missing authentication Header'});
    }
    
});

/*
    Responds to a Login Request at endpoint /Login/:userId/:password
    It checks the validity of the user and its password to login and also provide a token
    If the user isn't found 401 (Not Found) status is returned.
*/
userRouter.get("/Login/:userId/:password", (req,res,next)=>{
    let foundUser = findAndReturnUser(req,res);
    if(foundUser!==undefined)
    {
        bcrypt.compare(req.params.password, foundUser.password, function(err, result) {
            if(result)
            {
                let token = jwt.sign({userId: foundUser?.userId, firstName: foundUser?.firstName}, 'dekhgfdsghuvxv', {expiresIn:5000, subject:foundUser?.userId});
                res.status(202).send(token);
            }
            else
            {
                res.status(401).send({message:'Invalid Username and Password'});
            }
        })
    }
});



function findAndReturnUser(req:Request,res:Response): User|undefined
{
    let foundUser = userArray.find(u=>u.userId.toLowerCase()===req.params.userId.toLowerCase());
    if( foundUser == undefined)
    {
        res.status(404).send({message:'User Not Found', status:404});
    }

    return foundUser;
}


export {userRouter};
