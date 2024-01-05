const express=require('express');
const router=express.Router();
const {createNewNote,getAllNotes, updateNoteById, deleteById, searchByKeyword,shareById}=require('../controllers/notes')
//get a list of all notes for the authenticated user
router.get('/api/notes',(req,res,next)=>{

});
//get a note by id for authenticated user
router.get('/api/notes/:id',(req,res,next)=>{

});
//create a new note for the authenticated user
router.post('/api/notes',createNewNote);
//update an existing note by ID for authenticated user
router.put('/api/notes/:id',updateNoteById);
//delete an existing note by Id for authenticated user
router.delete('/api/notes/:id',deleteById)
//share a note with another user for authenticated user
router.post('/api/notes/:id/share',shareById);
//search for notes based on keywords for authenticated user
router.get('/api/search',searchByKeyword);
module.exports=router;