"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = __importDefault(require("express"));
const post_1 = require("../models/post");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postRouter = express_1.default.Router();
exports.postRouter = postRouter;
/*
   Responds to a Get request received at /Posts
   returns an array of all available posts
*/
postRouter.get("/", (req, res, next) => {
    res.status(200).send(post_1.postArray);
});
/*
   Responds to a Get request received at /Posts/:postId
   returns a specific post under normal circumstances
   returns 404 not found if the post doesn't exist
*/
postRouter.get("/:postId", (req, res, next) => {
    let foundPost = findAndReturnPost(req, res);
    if (foundPost)
        res.status(200).send(foundPost);
});
/*
    Responds to a Post request recieved at /Posts
    creates a new post record with the information provided if the postId provided
    isn't already in the system.
    If the postId provided already exists it returns an error 409 (Conflict)
    If all the required properties for a given user object aren't privided it returns status 406 UnAcceptable
*/
postRouter.post("/", (req, res, next) => {
    if (req.headers.token) {
        try {
            let tokenPayload = jsonwebtoken_1.default.verify(req.headers.token.toString(), 'dekhgfdsghuvxv');
            let newPost = post_1.postArray.find(u => u.postId === req.body.postId);
            if (newPost != undefined) {
                res.status(409).send({ message: 'Duplicate postId', status: 409 });
            }
            else if (req.body.content) {
                let newDate = new Date();
                let currentUser = tokenPayload.userId;
                newPost = new post_1.Post(req.body.postId, newDate, req.body.title, req.body.content, currentUser, req.body.headerImage, newDate);
                post_1.postArray.push(newPost);
                res.status(201).send(newPost);
            }
            else
                res.status(406).send({ message: 'The content of the post is a required field!' });
        }
        catch (ex) {
            console.log(ex);
            res.status(401).send({ message: 'Invalid Token' });
        }
    }
    else {
        res.status(401).send({ message: 'Missing authentication Header' });
    }
});
/*
    Responds to a Patch Request at /Psts/:postId
    It looks up a post in the postArray given the dynamic postId passed in the url.
    If post is found updates are made according to the payload.
    If post isn't found status 404 (not Found) is returned.
*/
postRouter.patch("/:postId", (req, res, next) => {
    let foundPost = findAndReturnPost(req, res);
    if (foundPost !== undefined) {
        if (req.body.title) {
            foundPost.title = req.body.title;
        }
        if (req.body.content) {
            foundPost.content = req.body.content;
        }
        if (req.body.headerImage) {
            foundPost.headerImage = req.body.headerImage;
        }
        let newDate = new Date();
        foundPost.lastUpdated = newDate;
        res.status(202).send(foundPost);
    }
});
/*
    Responds to a Delete Request at endpoint /Posts/:postId
    It looks for and removes the given postId (from the dynamic url segment) from the postArray
    If the post isn't found 404 (Not Found) status is returned.
*/
postRouter.delete("/:postId", (req, res, next) => {
    if (req.headers.token) {
        try {
            let tokenPayload = jsonwebtoken_1.default.verify(req.headers.token.toString(), 'dekhgfdsghuvxv');
            console.log(tokenPayload);
            let foundPost = findAndReturnPost(req, res);
            if (tokenPayload.userId === foundPost?.userId) {
                if (foundPost !== undefined) {
                    post_1.postArray.splice(post_1.postArray.findIndex(u => u.postId === foundPost?.postId), 1);
                    res.status(200).send({ message: 'Post Deleted' });
                }
            }
            else {
                res.status(401).send({ message: 'Not Authorized to Delete' });
            }
        }
        catch (ex) //Invalid Token
         {
            console.log(ex);
            res.status(401).send({ message: 'Invalid Token' });
        }
    }
    else {
        res.status(401).send({ message: 'Missing authentication Header' });
    }
});
/*
    Function that search and find a specific post in postArray
    Returns the post if found
    Returns 404 Post Not Found if the post doesn't exist
*/
function findAndReturnPost(req, res) {
    let foundPost = post_1.postArray.find(u => u.postId.toString().toLowerCase() === req.params.postId.toLocaleLowerCase());
    if (foundPost == undefined) {
        res.status(404).send({ message: 'Post Not Found', status: 404 });
    }
    return foundPost;
}
//# sourceMappingURL=postRoute.js.map