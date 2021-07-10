import bodyParser from 'body-parser';
import express from 'express';
import { postRouter } from './routes/postRoute';
import { userRouter } from './routes/userRoute';

let app = express();
console.log(process.cwd());
//Registers a middleware that parses the requests and apopends it to our body and it calls next() in the end for JSON formatter requests.
app.use(bodyParser.json());

 //Registers a middldeware that parses the request and appends it to our body and it calls next() in the end
app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine','pug');
app.set('views','src/views');


// Directs all requests starting with /Users to the userRouter
app.use("/Users", userRouter);
app.use("/Posts", postRouter);

// This is default route it returns documentation of the API. It uses PUG to generate it.
app.use("/", (req,res,next)=>{
    let apiEndPoints=[];
    apiEndPoints.push({method:'[GET]', url:'/Users', description:'Should return a list of any user in the database (as a JSON array) with all their properties'});
    apiEndPoints.push({method:'[POST]', url:'/Users', description:'Creates a new user with the properties userId,firstName, lastName, emailAddress. Returns an error for duplicate users'});
    apiEndPoints.push({method:'[GET]', url:'/Users/:userId', description:'Returns a User object for the specified userId, returns 404 Error if the user isn\'t found'});
    apiEndPoints.push({method:'[PATCH]', url:'/Users/:userId', description:'Updates an existing user passed dynamically in the URl. Updatable properties include firstName, lastName, emailAddress. Returns 404 error if User is not found'});
    apiEndPoints.push({method:'[DELETE]', url:'/Users/:userId', description:'Deletes an existing user passed dynamically in the URL. If user isn\'t found it returns error 404'});
    res.render('index', {API:apiEndPoints});
});
app.listen(3000);