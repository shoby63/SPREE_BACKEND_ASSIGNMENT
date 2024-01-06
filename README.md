**Assignment Details**:  You have been asked to build a secure and scalable RESTful API that allows users to create, read, update, and delete notes. The application should also allow users to share their notes with other users and search for notes based on keywords.



Technical Requirements

Implement a RESTful API using a framework of your choice (e.g. Express, DRF, Spring).
Use a database of your choice to store the data (preferably MongoDB or PostgreSQL).
Use any authentication protocol and implement a simple rate limiting and request throttling to handle high traffic.
Implement search functionality to enable users to search for notes based on keywords. ( preferably text indexing for high performance )
Write unit tests and integration tests your API endpoints using a testing framework of your choice.


API Endpoints

Your API should implement the following endpoints:

Authentication Endpoints

POST /api/auth/signup: create a new user account.

POST /api/auth/login: log in to an existing user account and receive an access token.
Note Endpoints

GET /api/notes: get a list of all notes for the authenticated user.
GET /api/notes/:id: get a note by ID for the authenticated user.
POST /api/notes: create a new note for the authenticated user.
PUT /api/notes/:id: update an existing note by ID for the authenticated user.
DELETE /api/notes/:id: delete a note by ID for the authenticated user.
POST /api/notes/:id/share: share a note with another user for the authenticated user.
GET /api/search?q=:query: search for notes based on keywords for the authenticated user.


Deliverables

A GitHub repository with your code.
A README file with
Details explaining the choice of framework/db/ any 3rd party tools.
instructions on how to run your code and run the tests.
Any necessary setup files or scripts to run your code locally or in a test environment.


Evaluation Criteria

Your code will be evaluated on the following criteria:

Correctness: does the code meet the requirements and work as expected?
Performance: does the code use rate limiting and request throttling to handle high traffic?
Security: does the code implement secure authentication and authorization mechanisms?
Quality: is the code well-organized, maintainable, and easy to understand?
Completeness: does the code include unit, integration, and end-to-end tests for all endpoints?
Search Functionality: does the code implement text indexing and search functionality to enable users to search for notes based on keywords?

**How to use Project on Local Development Server**
Speer Backend Assignment

Technologies Used: Node js, Express js, Json web Token (JWT) based authentication, Mongodb and Mongoose ORM. Mocha for writing and Integrating Tests. 

**How to use: **

   1-  install necessary Dependencies : **npm i**
   2-  To start the server use : **npm start. **
   
Using RestApis:

 1- Authentication endpoints:
 
     a) https:localhost:7000/api/auth/signup: Post request.
                          Req.body={ name:"abc",
                                    email:"xyz@gmail.com",
                                    password:"demo1234"
                                    }
        After Signup you need to hit Login endPoint to get access token.
   b) https:localhost:7000/api/auth/login: Post Request
   
                                           Req.body= { 
                                                       email:"xyz@gmail.com",
                                                       password:"demo1234"
                                                     }
        You will get access token to create, delete or updated notes. Acess token is valid only for 1 hour max.
  2- Note Endpoints: 
  
      a) localhost:7000/api/notes: All notes created by current user and notes shared with him. Shared Notes are Read Only.
      
      b) localhost:7000/api/notes/:id: Get a Note by id.
      
      c) localhost:7000/api/notes : Post Request to create a new Note.
      
                                 Req.body= 
                                             {
                                              title: 'Meeting Notes 1',
                                              content: 'Discuss project updates and plan for the next sprint.',
                                              }
                                              You need to pass authorization token.
                                              
     d) localhost:7000/api/notes/:id: Put Request to update the existing Note by Id only and only if Note is created by current user.
                                      Pass the auth token you got after login.
                                      Req.body={
                                                title:"Update the Note"
                                                content:"No need to discuss Project Updates"
                                                }
                                                
   e)  localhost:7000/api/notes/:id: Delete Request to delete a note by Id. 
   
                                     Pass the auth token you got after login. Note can only be delete if current user is owner of it.
                                     
   f)  localhost:7000/api/notes/:id/share: paas the id of the note u want to share .
   
                                           In request body pass the array of emails of the users to whom with u want to share your note.     
                                           
                                           Pass the auth token you got after login.
                                           
                                           req.body=["user1@gmail.com", "user2@gmail.com"].
                                           
  g)   localhost:7000/api/search :        pass the query keyword to search for your notes in database.
  
                                          Implemented Multi-key indexing and keyword based searching using MongoDb.
                                          
                                          pass the query keyword in params field.
                                          
                                          do not pass the query keyword in URL.
                                      

                                             
   
