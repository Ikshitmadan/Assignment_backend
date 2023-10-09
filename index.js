const express=require('express');
const cookie_parser=require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt=require('jsonwebtoken');
const UserNote = require('./Model/UserDataModel');
const User = require('./Model/UserModel');
const { createErrorMessage } = require('./Error');
const cors = require('cors');

dotenv.config()
const app = express();

app.use(express.json());


app.use(cookie_parser())
app.use(cors({
    origin: [ 
        'http://localhost:3000','https://assignment-frontend-blue.vercel.app' 
      ], 
      methods: ['GET', 'PUT', 'POST','DELETE','PATCH'], 
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'], 
      credentials: true, 
      maxAge: 600, 
      exposedHeaders: ['*', 'Authorization' ]
}))

const secretKey='secretKey'
const url=process.env.MONGO_URL;

const server=app.listen((8080),()=>{

    console.log(`connected to port `);

})

mongoose.connect(url).then(()=>{
    console.log(`connected to db`);
}).catch((err)=>console.log(err))


app.get('/auth',async(req,res)=>{
    const token=req.cookies?.token;
    if(!token){

        return res.status(400).json(createErrorMessage("no token found"));
            }
            const UserData=jwt.verify(token,secretKey,{},(err,payload)=>{
        
                if(err){
        
                    return res.status(401).json(err.message);
                }
                if(payload){
        
                    return res.status(200).send({
                        id:payload.id,
                    })
                }
        
            })
        
        

})



  



const verify=async(req,res,next)=>{


    const token=req.cookies?.token;

    console.log(req.coo);

    if(!token){

return res.json(createErrorMessage("no token found"));
    }

    const UserData=jwt.verify(token,secretKey)

    const {id,email}=UserData;

    req.userId=id;

    next();




}





app.post('/signup',async(req,res)=>{



    try{
        const user=await User.create(req.body);

        res.send(user);
    }

    catch(err){

        res.send(createErrorMessage(err.message));


    }
})





 app.post('/login',async(req,res)=>{

    const {email,password}  =req.body;
    try{

        const user=await User.findOne({email:email});

        console.log(user,"yo");

        if(!user){

            console.log(`he`);
           return res.status(400).send(createErrorMessage("Email not found"));


        }

        if(user.password!=password){

            console.log(`she`);

         return res.status(400).json(createErrorMessage("password is incorrect"))
        }


      const token=await jwt.sign({id:user._id,email:user.email},secretKey,{})


      res.cookie('token', token, {
        expires: new Date(Date.now() + (3600 * 1000 * 24 * 180 * 1)), //second min hour days year
        secure: true, // set to true if your using https or samesite is none
        httpOnly: true, // backend only
        sameSite: 'none' // set to none for cross-request
      });

      

      return res.send(user);
    }
    catch(err){

        return res.status(500).send(createErrorMessage(err.message));

    }

 })


 app.get('/',(req,res)=>{
    res.send('hi from app');
 })

app.get('/users',verify,async(req,res)=>{

  const query=req.query;

  const {name}=query;
  
    try{
        const User =await UserNote.find({owner:req.userId});
res.status(200).send(User);
        
    }
    catch(err){

const errMessge=new Error(err);

res.status(400).send(errMessge);
    }

  


})


app.post('/logout',async(req,res)=>{

    res.clearCookie('token',{ secure: true, // set to true if your using https or samesite is none
    httpOnly: true, // backend only
    sameSite: 'none'});

    return res.json({message:"logout sucesss"})

})


app.get('/user/:id',verify,async(req,res)=>{

    const id=req.params.id;
    const User=await UserNote.findOne({_id:id});

    res.status(200).send(User);

})


app.patch('/user/:id',verify,async(req,res)=>{

    try{

        const UpdateUser=req.body;

        const user=await UserNote.findOne({_id:req.params.id});

        if(!user){
            return res.status(401).send(createErrorMessage('user not found'));
        }
      

        console.log(user.owner +' &'+req.userId);

        if(user.owner!=req.userId){

            return res.status(401).send(createErrorMessage('you cannnot change other created user'));

        }


      const data= await UserNote.updateOne({_id:req.params.id},{$set:{...UpdateUser,updatedAt:Date.now()}})
      res.send(data);


    }

    catch(err){

    }

})
  
app.delete('/user/:id',verify,async(req,res)=>{

    const id=req.params.id;
    const user=await UserNote.findOne({_id:req.params.id});

    if(!user){
        return res.status(401).send(createErrorMessage('user not found'));
    }

    if(user.owner!=req.userId){
        return res.status(400).send(createErrorMessage("you are not authorized for this deletion"))
    }
    await UserNote.findByIdAndDelete(id);

    res.status(200).send('user deleted');

});

app.post('/user',verify,async(req,res)=>{

    const User=await UserNote.create({...req.body,owner:req.userId});

    res.json(User);

})

