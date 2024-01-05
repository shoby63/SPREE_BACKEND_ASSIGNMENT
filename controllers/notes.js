const User = require("../models/user");
const Notes = require("../models/notes");
const { v4: uuidv4 } = require("uuid");
// const {getDetails}=require('./auth');
const jwt = require("jsonwebtoken");
exports.getDetails = (authToken) => {
  if (authToken) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        authToken.replace("Bearer ", ""),
        process.env.SECRET_KEY,
        (err, user) => {
          if (err) {
            reject({ message: "Forbidden: Invalid token" });
          } else {
            console.log("user", user);
            resolve(user);
            // User.findOne({ email: user?.email })
            //   .exec()
            //   .then((result) => {
            //     const payload = {
            //       status: true,
            //       content: {
            //         data: {
            //           id: result.id,
            //           name: result.name,
            //           email: result.email,
            //           created_at: result.created_at,
            //         },
            //       },
            //     };

            // })
            // .catch((err) => {
            //   console.log(err);
            //   reject({
            //     status: false,
            //     message: "User Does not exist",
            //     error: err,
            //   });
            // });
          }
        }
      );
    });
  } else {
    return {
      err: "user not found",
    };
  }
};
exports.getAllNotes = async (req, res, next) => {
  try{
  const userInfo = this.getDetails(req.headers.authorization);
  const results= await Notes.find({ owner: userInfo.id });
  const sharedNotes= await Notes.find({sharedWith:userInfo.email});
  const mergedResults = [...results, ...sharedNotes];
  return res.status(200).json({status:"success",content:mergedResults});
  }catch(err){
    return res.status(400).json({status:'Internal Server Error',err:err})
  }

};
exports.findNoteById= async (req,res,next)=>{
        try{
          const noteId=req.params.id;
          const userInfo= await this.getDetails(req.headers.authorization);
          const note= Notes.findOne({id:noteId});
          if(note.owner===userInfo.id){
            return res.status(200).json({info:"Note fetched successfully",content:note})
          }else{
            return res.status(200).json({"status": "Unauthorized to access that note"})
          }
        }catch(err){
          return res.status(400).json({status:"Internal server error",err:err})
        }
}
exports.createNewNote = async (req, res, next) => {
  const userInfo = await this.getDetails(req.headers.authorization);
  const { title, content } = req.body;
  if (userInfo) {
    try {
      const newnoteItem = new Notes({
        id: uuidv4(),
        title: title,
        content: content,
        owner: userInfo?.id,
      });
      newnoteItem
        .save()
        .then((result) => {
          console.log(result);
          return res.status(200).json({
            status: 200,
            payload: {
              info: "Note created Successfully",
              id: result.id,
            },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({
            status: 400,
            payload: {
              info: "Note creation failed, Internal Server Error",
            },
          });
        });
    } catch (err) {
      return res
        .status(400)
        .json({ status: "Internal server error", err: err });
    }
  }
};
exports.updateNoteById = async (req, res, next) => {
  try {
    const user = await this.getDetails(req.headers.authorization);
    const noteId = req.params.id.slice(1);
    const updatedNoteData = req.body;

    if (noteId && user) {
      // Find the details of the note
      Notes.findOne({ id: noteId })
        .then((foundNote) => {
          if (!foundNote) {
            return res.status(404).json({
              status: "Note not found",
            });
          }

          // Check if the current user is the owner of this note
          if (foundNote.owner === user.id) {
            Notes.findOneAndUpdate({ id: noteId }, updatedNoteData, {
              new: true,
            })
              .then((updatedNote) => {
                if (!updatedNote) {
                  return res.status(500).json({
                    status: "Failed to update the note, please try again.",
                  });
                }

                return res.status(200).json({
                  status: 200,
                  payload: {
                    id: updatedNote.id,
                    title: updatedNote.title,
                    content: updatedNote.content,
                    owner: updatedNote.owner,
                  },
                });
              })
              .catch((updateErr) => {
                return res.status(500).json({
                  status: "Server failed to update the note. Please try again.",
                  err: updateErr,
                });
              });
          } else {
            return res.status(403).json({
              status: "Unauthorized to update the note.",
            });
          }
        })
        .catch((findErr) => {
          console.error(findErr);
          return res.status(500).json({
            status: "Failed to load the note details. Please try again.",
            err: findErr,
          });
        });
    } else {
      return res.status(400).json({
        status: "Invalid note ID or user information.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Server failed to update the note. Please try again.",
      err: err,
    });
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    const userInfo = await this.getDetails(req.headers.authorization);
    const noteId = req.params.id.slice(1);
    if (!noteId || !userInfo) {
      return res.status(400).json({
        status: "Bad Request",
        meta: {
          info: null,
          metaInfo: "Invalid noteId or missing userInfo",
        },
      });
    }

    const note = await Notes.findOne({ id: noteId });

    if (!note) {
      return res.status(404).json({
        status: "Not Found",
        meta: {
          info: null,
          metaInfo: "Note not found",
        },
      });
    }

    if (note.owner !== userInfo?.id) {
      return res.status(403).json({
        status: "Forbidden",
        meta: {
          info: null,
          metaInfo: "User is not the owner of the note",
        },
      });
    }

    const deletedNote = await Notes.findOneAndDelete({ id: noteId });

    return res.status(200).json({
      status: "Success",
      meta: {
        message: "Note deleted successfully",
        deletedNote,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "Internal Server Error",
      meta: {
        info: err,
        metaInfo: "Failed to perform the operation",
      },
    });
  }
};

exports.searchByKeyword = async (req, res, next) => {
  const query = req.query.query;
  // Notes.index({ title:"text",content: "text" });
  try {
    // Perform text search using $text and $search
    const results = await Notes.find({ $text: { $search: query } });
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error.", err: error });
  }
};
exports.shareById = async (req, res, next) => {
  try {
    const noteId = req.params.id.slice(1);
    const userInfo = await this.getDetails(req.headers.authorization);
    const sharedUsers = req.body.sharedWith;
    const getNote = await Notes.findOne({ id: noteId });
    if (getNote.owner === userInfo?.id) {
      const sharedUser = await Notes.findOneAndUpdate(
        { id: noteId },
        {
          sharedWith: [...getNote.sharedWith, ...sharedUsers],
        },
        {
          new: true,
        }
      );
      return res.status(200).json({ status: 400, updatedNote: sharedUser });
    } else {
      return res
        .status(200)
        .json({
          status: 400,
          err: "Unauthenticated to share access to this note",
        });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ status: 404, err: "Failed to share Note", metaInfo: err });
  }
};
