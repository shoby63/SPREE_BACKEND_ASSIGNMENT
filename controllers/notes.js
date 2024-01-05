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
  const userInfo = this.getDetails(req.headers.authorization);
  Notes.find({ owner: userInfo.id }).then((result) => {
    console.log(result);
  });
  return res.status(200).json({
    data: result,
  });
};
exports.createNewNote = async (req, res, next) => {
  const userInfo = await this.getDetails(req.headers.authorization);
  console.log(userInfo);
  const { title, content } = req.body;
  if (userInfo) {
    try {
      const newnoteItem = new Notes({
        id: uuidv4(),
        title: title,
        content: content,
        owner: userInfo?.content?.data?.id,
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
  const userInfo = await this.getDetails(req.headers.authorization);
  const noteId = req.params.id;
  const updatedNote = req.body;
  if (noteId && userInfo) {
    try {
      //find the details of owner or more specifically owner
      Notes.findById(noteId)
        .then((res) => {
          console.log(res);
          //check if current user is owner of this note or not?
          if (res.owner === userInfo?.content?.data?.id) {
            Notes.findOneAndUpdate({ id: noteId }, updatedNote, {
              new: true,
            })
              .then((doc) => {
                console.log(doc);
                return res.status(200).json({
                  status: 200,
                  payload: {
                    id: doc.id,
                    title: doc.title,
                    content: doc.content,
                    owner: doc.owner,
                  },
                });
              })
              .catch((err) => {
                return res.status(200).json({
                  status: "Server failed to update the Note Please Try Again!",
                  err: err,
                });
              });
          } else {
            return res.status(200).json({
              status: "Unauthenticated to update Note",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({
            status: "Note does not exist or failed to load the current Note",
            err: err,
          });
        });
    } catch (err) {
      return res.status(400).json({
        status: "Server failed to update the Note Please Try Again!",
        err: err,
      });
    }
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
